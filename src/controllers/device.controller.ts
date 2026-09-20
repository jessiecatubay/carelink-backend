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
import { sendPatientCaregiversNotification } from "../services/notification.service";

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

  public command = async (req: Request, res: Response) => {
    const { deviceId, command, patientId } = req.body;

    console.log("Patient pressed a command", req.body);

    const connectedNonpatients = req.body.connectedNonpatients;

    const result = SendDeviceCommand(deviceId, command, patientId);

    const createdCommands = [];
    const payload = [];

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

      try {
        await sendPatientCaregiversNotification(patientId, {
          title: "Request Satisfied",
          body: "The patient's request has been marked as satisfied.",
          data: {
            command: "SATISFIED",
            patientId,
          },
        });
      } catch (error) {
        console.error("Push notification error:", error);
      }

      return res.status(200).json({
        success: true,
        status: "success",
        message: "Successfully emitted satisfied",
      });
    }

    for (const nonPatientId of connectedNonpatients) {
      const createdCommand = await CreateCommandService(
        deviceId,
        command.toUpperCase(),
        patientId,
        nonPatientId,
      );

      createdCommands.push(createdCommand);

      payload.push({
        deviceId,
        command,
        nonPatientId,
        recordedAt: createdCommand.data?.recordedAt,
        status: createdCommand.data?.status,
      });
    }

    try {
      emitPatientAlert(patientId, payload[0]);
    } catch (error) {
      console.error("Socket not initialized:", error);
    }

    try {
      const normalizedCommand = command.toUpperCase();

      let title = "CareLink Alert";
      let body = "The patient sent a new alert.";

      switch (normalizedCommand) {
        case "FOOD":
          title = "Food Assistance";
          body = "The patient is requesting food.";
          break;

        case "WATER":
          title = "Water Assistance";
          body = "The patient is requesting water.";
          break;

        case "ASSISTANCE":
          title = "Assistance Requested";
          body = "The patient is requesting assistance.";
          break;

        case "EMERGENCY":
          title = "Emergency Alert";
          body = "The patient has triggered an emergency alert.";
          break;
      }

      await sendPatientCaregiversNotification(patientId, {
        title,
        body,
        data: {
          command: normalizedCommand,
          patientId,
        },
      });
      console.log("Sending push notification for patient:", patientId);
      console.log("Connected non-patients:", connectedNonpatients);

    } catch (error) {
      console.error("Push notification error:", error);
    }

    return res.status(createdCommands[0].code).json({
      ...result,
      data: createdCommands,
    });
  };
}
