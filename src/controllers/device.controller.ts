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
import { prisma } from "../lib/prisma";
import { sendPatientCaregiversNotification } from "../services/notification.service";
import { GetUserByDeviceService } from "@/services/patientProfile";

export class DeviceController {
  public patientVitals = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      console.log();
      console.log("================================");
      console.log("      DEVICE VITALS RECEIVED");
      console.log("================================");

      console.log("Request body:", req.body);

      const {
        deviceId,
        temperature,
        heartRate,
        sensorContact,
        batteryLevel,
        batteryVoltage,
        irValue,
      } = req.body as DeviceData & {
        irValue?: number;
      };

      console.log();
      console.log("Parsed device data:");
      console.log({
        deviceId,
        temperature,
        heartRate,
        sensorContact,
        batteryLevel,
        batteryVoltage,
        irValue,
      });

      if (!deviceId) {
        console.error("ERROR: deviceId is missing.");

        return res.status(400).json({
          success: false,
          message: "deviceId is required",
        });
      }

      const receivedAt = new Date().toISOString();

      // ============================================================
      // FIND USER BY DEVICE
      // ============================================================

      console.log();
      console.log("Looking up user by device...");
      console.log("Device ID:", deviceId);

      const user = await GetUserByDeviceService(deviceId);

      console.log();
      console.log("GetUserByDeviceService completed.");

      console.log("User result:", user);

      // ============================================================
      // USER NOT FOUND
      // ============================================================

      if (!user.data?.userId) {
        console.error();
        console.error("================================");
        console.error("   DEVICE USER NOT FOUND");
        console.error("================================");
        console.error(
          `No user is associated with device: ${deviceId}`,
        );

        return res.status(404).json({
          success: false,
          message: "Device is not associated with a patient",
          data: {
            deviceId,
          },
        });
      }

      console.log(
        "Patient/User ID:",
        user.data.userId,
      );

      // ============================================================
      // CREATE VITALS HISTORY
      // ============================================================

      console.log();
      console.log("Creating vitals history...");

      const vitalsResult = await CreateVitalsHistoryService(
        deviceId,
        temperature,
        heartRate,
        sensorContact,
        batteryLevel,
        batteryVoltage,
      );

      console.log(
        "CreateVitalsHistoryService completed.",
      );

      console.log(
        "Vitals history result:",
        vitalsResult,
      );

      // ============================================================
      // SOCKET PAYLOAD
      // ============================================================

      const payload = {
        deviceId,
        temperature,
        heartRate,
        sensorContact,
        batteryLevel,
        batteryVoltage,
        irValue,
        receivedAt,
      };

      console.log();
      console.log("Vitals payload:");

      console.log(
        JSON.stringify(
          payload,
          null,
          2,
        ),
      );

      // ============================================================
      // EMIT SOCKET EVENT
      // ============================================================

      console.log();
      console.log(
        "Emitting patientVitals socket event..."
      );

      try {
        emitPatientVitals(
          user.data.userId,
          payload,
        );

        console.log(
          "patientVitals socket event emitted."
        );

      } catch (socketError) {

        console.error(
          "Socket emission failed:",
          socketError,
        );
      }

      // ============================================================
      // SEND HTTP RESPONSE
      // ============================================================

      console.log();
      console.log(
        "Sending HTTP 200 response to device..."
      );

      const response = {
        success: true,
        message: "Vitals received",
        data: payload,
      };

      console.log(
        "Response:",
        JSON.stringify(
          response,
          null,
          2,
        ),
      );

      return res.status(200).json(response);

    } catch (error) {

      console.error();
      console.error(
        "================================"
      );
      console.error(
        "       VITALS ERROR"
      );
      console.error(
        "================================"
      );

      console.error(
        "Error while processing device vitals:"
      );

      console.error(error);

      if (error instanceof Error) {
        console.error(
          "Error message:",
          error.message,
        );

        console.error(
          "Error stack:",
          error.stack,
        );
      }

      return res.status(500).json({
        success: false,
        message: "Failed to process device vitals",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  };

  public getFullPatientVitals = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      if (!req?.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const pagination = parsePagination(
        req.query,
      );

      if ("error" in pagination) {
        return res
          .status(400)
          .json({
            success: false,
            message: pagination.error,
          });
      }

      const result =
        await GetVitalsHistoryService(
          req.user.id,
          pagination,
        );

      return res
        .status(result.code)
        .json(result);

    } catch (error) {

      console.error(
        "Get full patient vitals error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get patient vitals",
      });
    }
  };

  public getRecentPatientVitals = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result =
        await GetRecentVitalsHistoryService(
          req.user.id,
        );

      return res
        .status(result.code)
        .json(result);

    } catch (error) {

      console.error(
        "Get recent patient vitals error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get recent patient vitals",
      });
    }
  };

  public command = async (
    req: Request,
    res: Response,
  ) => {
    const {
      deviceId,
      command,
      patientId,
    } = req.body;

    console.log(
      "Patient pressed a command",
      req.body,
    );

    const rawConnected =
      req.body.connectedNonpatients;

    let connectedNonpatients: string[] =
      Array.isArray(rawConnected)
        ? rawConnected
            .map((item: any) =>
              typeof item === "string"
                ? item
                : item?.nonPatientId,
            )
            .filter(Boolean)
        : [];

    if (connectedNonpatients.length === 0 && patientId) {
      try {
        const connections = await prisma.patientNonPatient.findMany({
          where: {
            patientId,
            status: "CONNECTED",
          },
          select: {
            nonPatientId: true,
          },
        });
        connectedNonpatients = connections.map((c) => c.nonPatientId);
      } catch (e) {
        console.warn("Could not load connected caregivers:", e);
      }
    }

    const result =
      SendDeviceCommand(
        deviceId,
        command,
        patientId,
      );

    const createdCommands = [];
    const payload = [];

    const normalizedCommand =
      (command || "").toUpperCase();

    if (
      normalizedCommand === "SATISFIED"
    ) {
      let updatedCommandId:
        | string
        | undefined;

      for (
        const nonPatientId of
        connectedNonpatients
      ) {
        const updated =
          await UpdateLatestCommandService(
            nonPatientId,
            {
              status: "Satisfied",
            },
            patientId,
          );

        updatedCommandId ??=
          updated.data?.id;
      }

      emitSatisfied(
        patientId,
        updatedCommandId ??
          "satisfied",
      );

      try {
        await sendPatientCaregiversNotification(
          patientId,
          {
            title:
              "Request Satisfied",
            body:
              "The patient's request has been marked as satisfied.",
            data: {
              command:
                "SATISFIED",
              alertType:
                "SATISFIED",
              patientId,
            },
          },
        );
      } catch (error) {
        console.error(
          "Push notification error:",
          error,
        );
      }

      return res.status(200).json({
        success: true,
        status: "success",
        message:
          "Successfully emitted satisfied",
      });
    }

    for (
      const nonPatientId of
      connectedNonpatients
    ) {
      const createdCommand =
        await CreateCommandService(
          deviceId,
          normalizedCommand as any,
          patientId,
          nonPatientId,
        );

      createdCommands.push(
        createdCommand,
      );

      payload.push({
        id:
          createdCommand.data?.id,
        deviceId,
        command:
          normalizedCommand,
        alertType:
          normalizedCommand,
        nonPatientId,
        recordedAt:
          createdCommand.data
            ?.recordedAt
            ? new Date(
                createdCommand.data.recordedAt,
              ).toISOString()
            : new Date().toISOString(),
        status:
          createdCommand.data
            ?.status ?? "Pending",
        patientId,
      });
    }

    // Fetch patient info for rich notification and alert modal
    let patientName = "Connected Patient";
    let patientPhone = "";
    try {
      const patientUser = await prisma.user.findUnique({
        where: { id: patientId },
        include: {
          patientProfile: {
            include: {
              emergencyContacts: true,
            },
          },
          nonPatientProfile: true,
        },
      });

      if (patientUser) {
        const full = `${patientUser.firstName ?? ""} ${patientUser.lastName ?? ""}`.trim();
        if (full) {
          patientName = full;
        }

        const priorityContact =
          patientUser.patientProfile?.emergencyContacts?.find((c) => c.isPriority) ??
          patientUser.patientProfile?.emergencyContacts?.[0];

        patientPhone =
          priorityContact?.phoneNumber ??
          patientUser.nonPatientProfile?.emergencyContact ??
          "";
      }
    } catch (e) {
      console.warn("Could not load patient user details:", e);
    }

    try {
      const socketPayload = {
        id: createdCommands[0]?.data?.id,
        deviceId,
        command: normalizedCommand,
        alertType: normalizedCommand,
        patientId,
        patientName,
        phoneNumber: patientPhone,
        recordedAt: new Date().toISOString(),
        status: "Pending",
      };

      emitPatientAlert(patientId, socketPayload);
    } catch (error) {
      console.error(
        "Socket not initialized:",
        error,
      );
    }

    try {
      let title = "CareLink Alert";
      let body = `${patientName} sent a new alert.`;
      let channelId = "carelink-alerts";

      switch (normalizedCommand) {
        case "FOOD":
          title = "🍱 Food Assistance";
          body = `${patientName} is requesting food.`;
          channelId = "carelink-alerts";
          break;

        case "WATER":
          title = "💧 Water Assistance";
          body = `${patientName} is requesting water.`;
          channelId = "carelink-alerts";
          break;

        case "ASSISTANCE":
          title = "🙋 Assistance Requested";
          body = `${patientName} is requesting assistance.`;
          channelId = "carelink-alerts";
          break;

        case "EMERGENCY":
          title = "🚨 CARELINK EMERGENCY";
          body = `${patientName} needs emergency assistance.\nPatient activated the Emergency button.`;
          channelId = "carelink-emergency-v2";
          break;
      }

      await sendPatientCaregiversNotification(
        patientId,
        {
          title,
          body,
          channelId,
          data: {
            command: normalizedCommand,
            alertType: normalizedCommand,
            type: normalizedCommand,
            patientId,
            patientName,
            phoneNumber: patientPhone,
            timestamp: new Date().toLocaleTimeString(),
          },
        },
        connectedNonpatients,
      );

      console.log(
        "Sending push notification for patient:",
        patientId,
        "Command:",
        normalizedCommand,
      );

      console.log(
        "Connected non-patients:",
        connectedNonpatients,
      );

    } catch (error) {
      console.error(
        "Push notification error:",
        error,
      );
    }

    return res
      .status(
        createdCommands[0]?.code ??
          200,
      )
      .json({
        success: true,
        status: "success",
        message:
          normalizedCommand === "EMERGENCY"
            ? "Emergency alert sent successfully to connected caregivers"
            : "Command processed successfully",
        data: createdCommands,
      });
  };
}