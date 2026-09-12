import {
  emitPatientAlert,
  emitPatientVitals,
  emitSatisfied,
} from "@/lib/socket";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import {
  CreateCommandService,
  UpdateLatestCommandService,
} from "@/services/command";
import {
  CreateVitalsHistoryService,
  GetRecentVitalsHistoryService,
  GetVitalsHistoryService,
} from "@/services/device";
import { SendDeviceCommand } from "@/services/mqtt.service";
import { DeviceData } from "@/types/user";
import { parsePagination } from "@/utils/pagination";
import { Request, Response } from "express";

export class DeviceController {
  public patientVitals = async (req: AuthenticatedRequest, res: Response) => {
    const { deviceId, temperature, heartRate, sensorContact } =
      req.body as DeviceData;
    const receivedAt = new Date().toISOString();

    console.log(
      "Received device vitals:",
      { deviceId, temperature, heartRate, sensorContact },
      "receivedAt",
      receivedAt,
    );

    await CreateVitalsHistoryService(
      deviceId,
      temperature,
      heartRate,
      sensorContact,
    );

    const payload = {
      ...{ deviceId, temperature, heartRate, sensorContact },
      receivedAt,
    };

    if (req.user?.role === "PATIENT" && req.user.id) {
      emitPatientVitals(req.user.id, payload);
    }

    return res.status(200).json({
      success: true,
      message: "Vitals received",
      data: payload,
    });
  };

  public getFullPatientVitals = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req?.user?.id) return;
    const pagination = parsePagination(req.query);

    if ("error" in pagination) {
      return res
        .status(400)
        .json({ success: false, message: pagination.error });
    }

    const result = await GetVitalsHistoryService(req.user.id, pagination);

    return res.status(result.code).json(result);
  };

  public getRecentPatientVitals = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    if (!req.user?.id) return;
    const result = await GetRecentVitalsHistoryService(req.user.id);

    return res.status(result.code).json(result);
  };

  public command = async (req: AuthenticatedRequest, res: Response) => {
    const { deviceId, command, patientId, connectedNonpatients } = req.body;

    if (!req.user?.id || req.user.id !== patientId) {
      return res.status(403).json({
        success: false,
        status: "error",
        message: "You can only send commands for your own patient account",
      });
    }

    if (command.toLowerCase() === "satisfied") {
      let updatedCommandId: string | undefined;
      for (const { nonPatientId } of connectedNonpatients) {
        const updated = await UpdateLatestCommandService(
          nonPatientId,
          {
            status: "Satisfied",
          },
          patientId,
        );
        updatedCommandId ??= updated.data?.id;
      }
      if (updatedCommandId) {
        emitSatisfied(patientId, updatedCommandId);
      }
      return res.status(200).json({
        success: true,
        status: "success",
        message: "Successfully emitted satisfied",
      });
    }

    const result = await SendDeviceCommand(deviceId, command, patientId);
    if (!result.success) {
      return res.status(503).json({ ...result, data: [] });
    }
    const createdCommands = [];
    const payload = [];
    for (const { nonPatientId } of connectedNonpatients) {
      const createdCommand = await CreateCommandService(
        deviceId,
        command.toUpperCase(),
        patientId,
        nonPatientId,
      );

      createdCommands.push(createdCommand);

      payload.push({
        id: createdCommand.data?.id,
        deviceId,
        command,
        recordedAt: createdCommand.data?.recordedAt,
        status: createdCommand.data?.status,
      });
    }

    try {
      emitPatientAlert(patientId, payload[0]);
    } catch (error) {
      console.error("Socket not initialized: ", error);
    }

    return res.status(200).json({
      ...result,
      data: createdCommands,
    });
  };
}
