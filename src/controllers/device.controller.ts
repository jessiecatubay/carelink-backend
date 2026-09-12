import { DeviceData } from "@/types/user";
import { Request, Response } from "express";
import { getSocket } from "@/lib/socket";
import {
  GetVitalsHistoryService,
  CreateVitalsHistoryService,
  GetRecentVitalsHistoryService,
} from "@/services/device";
import { SendDeviceCommand } from "@/services/mqtt.service";
import {
  CreateCommandService,
  UpdateLatestCommandService,
} from "@/services/command";
import { emitPatientAlert } from "@/lib/socket";
import { connected } from "node:process";
import { AuthenticatedRequest } from "@/middlewares/authenticate-token";
import { parsePagination } from "@/utils/pagination";
import { emitSatisfied } from "@/lib/socket";

export class DeviceController {
  public patientVitals = async (req: Request, res: Response) => {
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

    try {
      const io = getSocket();
      io.emit("patientVitals", payload);
    } catch (error) {
      console.error("Socket not initialized:", error);
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

  public getRecentPatientVitals = async (req: Request, res: Response) => {
    const result = await GetRecentVitalsHistoryService();

    return res.status(result.code).json(result);
  };

  public command = async (req: Request, res: Response) => {
    const { deviceId, command, patientId } = req.body;
    console.log("Patient pressed a command", req.body);
    const connectedNonpatients = JSON.parse(req.body.connectedNonpatients);

    const result = SendDeviceCommand(deviceId, command, patientId);
    if (command.toLowerCase() === "satisfied") {
      for (const nonPatientId of connectedNonpatients) {
        await UpdateLatestCommandService(nonPatientId, {
          status: "Satisfied",
        });
      }
      emitSatisfied(patientId, crypto.randomUUID());
      return {
        code: 200,
        status: "success",
        message: "Successfully emitted satisfied",
      };
    }
    const createdCommands = [];
    const payload = [];
    for (const nonPatientId of connectedNonpatients) {
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

    return res.status(result.success ? 200 : 503).json({
      ...result,
      data: createdCommands,
    });
  };
}
