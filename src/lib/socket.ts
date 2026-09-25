import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { prisma } from "@/lib/prisma";
import {
  patientAlertEventSchema,
  patientVitalsEventSchema,
} from "@/schemas/socket.schema";
import { verifyAccessToken } from "@/utils/jwt";
import { z } from "zod";

let io: Server | null = null;

interface SocketUser {
  userId: string;
  role: "PATIENT" | "NON_PATIENT" | "USER";
}

const jwtPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  role: z.enum(["PATIENT", "NON_PATIENT", "USER"]).optional(),
});

/**
 * Patient room
 *
 * Example:
 * patient:550e8400-e29b-41d4-a716-446655440000
 */
export const getPatientRoom = (patientId: string) => {
  return `patient:${patientId}`;
};

const patientPresence = new Map<
  string,
  {
    lastHeartbeat: number;
    isOnline: boolean;
  }
>();

const PATIENT_OFFLINE_TIMEOUT = 30_000;

const checkPatientOffline = (patientId: string) => {
  const presence = patientPresence.get(patientId);

  if (!presence) {
    return;
  }

  const elapsed = Date.now() - presence.lastHeartbeat;

  if (elapsed >= PATIENT_OFFLINE_TIMEOUT && presence.isOnline) {
    presence.isOnline = false;

    const room = getPatientRoom(patientId);

    io?.to(room).emit("patientConnectionStatus", {
      patientId,
      status: "DISCONNECTED",
      timestamp: new Date().toISOString(),
    });

    console.log(`🔴 Patient ${patientId} is now OFFLINE`);
  }
};

setInterval(() => {
  for (const [patientId] of patientPresence) {
    checkPatientOffline(patientId);
  }
}, 5000);

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  setInterval(() => {
    for (const patientId of patientPresence.keys()) {
      checkPatientOffline(patientId);
    }
  }, 5000);

  /**
   * Authenticate every socket connection
   */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwtPayloadSchema.parse(verifyAccessToken(token));

      const userId = decoded.id;

      if (!userId) {
        return next(new Error("Invalid authentication token"));
      }

      socket.data.user = {
        userId,
        role: decoded.role ?? "USER",
      } satisfies SocketUser;

      next();
    } catch (error) {
      console.error("Socket authentication failed:", error);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user as SocketUser;

    console.log("🟢 Socket connected:", socket.id);
    console.log("User:", user.userId);
    console.log("Role:", user.role);

    /**
     * ============================================================
     * PATIENT
     * ============================================================
     *
     * A patient joins their own room.
     *
     * Example:
     * patient:abc123
     */
    if (user.role === "PATIENT") {
      const room = getPatientRoom(user.userId);

      socket.join(room);

      console.log(`👤 Patient joined room: ${room}`);
    }

    socket.on("patient:heartbeat", () => {
      if (user.role !== "PATIENT") {
        return;
      }

      const existing = patientPresence.get(user.userId);

      const wasOffline = !existing?.isOnline;

      patientPresence.set(user.userId, {
        lastHeartbeat: Date.now(),
        isOnline: true,
      });

      console.log(`💓 Heartbeat received from patient ${user.userId}`);

      if (wasOffline) {
        const room = getPatientRoom(user.userId);

        io?.to(room).emit("patientConnectionStatus", {
          patientId: user.userId,
          status: "CONNECTED",
          timestamp: new Date().toISOString(),
        });

        console.log(`🟢 Patient ${user.userId} is now ONLINE`);
      }
    });

    /**
     * ============================================================
     * NON-PATIENT / CAREGIVER
     * ============================================================
     *
     * Find all patients connected to this caregiver.
     *
     * PatientNonPatient:
     *
     * patientId    -> patient User.id
     * nonPatientId -> caregiver User.id
     */
    if (user.role === "NON_PATIENT") {
      try {
        const connections = await prisma.patientNonPatient.findMany({
          where: {
            nonPatientId: user.userId,
            status: "CONNECTED",
          },
          select: {
            patientId: true,
          },
        });

        console.log("mga connections", connections);

        for (const connection of connections) {
          const room = getPatientRoom(connection.patientId);

          socket.join(room);

          console.log(`👨‍⚕️ Non-patient ${user.userId} joined ${room}`);
        }
      } catch (error) {
        console.error("Failed to join patient rooms:", error);
      }
    }

    /**
     * ============================================================
     * PATIENT VITALS
     * ============================================================
     *
     * This event should normally come from your backend/device
     * flow. If a patient socket emits it, send it only to the
     * patient's own room.
     */
    socket.on("patient:vitals", (payload) => {
      if (user.role !== "PATIENT") {
        console.warn(`Unauthorized patient:vitals from ${user.userId}`);

        return;
      }

      const parsed = patientVitalsEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.warn("Invalid patient:vitals payload", parsed.error.issues);
        return;
      }

      const room = getPatientRoom(user.userId);

      io?.to(room).emit("patientVitals", {
        ...parsed.data,
        patientId: user.userId,
      });
    });

    /**
     * ============================================================
     * PATIENT ALERT
     * ============================================================
     *
     * Only the patient can generate a patient alert through this
     * socket event.
     */
    socket.on("patient:alert", (payload) => {
      if (user.role !== "PATIENT") {
        console.warn(`Unauthorized patient:alert from ${user.userId}`);

        return;
      }

      const parsed = patientAlertEventSchema.safeParse(payload);
      if (!parsed.success) {
        console.warn("Invalid patient:alert payload", parsed.error.issues);
        return;
      }

      const room = getPatientRoom(user.userId);

      io?.to(room).emit("patientAlert", {
        ...parsed.data,
        patientId: user.userId,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id}`, reason);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized.");
  }

  return io;
};

/**
 * ================================================================
 * SERVER -> CAREGIVERS
 * ================================================================
 */

/**
 * Send latest vitals to caregivers connected to a patient.
 */
export const emitPatientVitals = (
  patientId: string,
  payload: Record<string, any>,
) => {
  if (!io) {
    console.warn("Socket.io is not initialized");
    return;
  }

  const room = getPatientRoom(patientId);

  io.to(room).emit("patientVitals", {
    ...payload,
    patientId,
  });

  console.log(`❤️ Vitals emitted to ${room}`);
};

/**
 * Send a patient alert to caregivers connected to a patient.
 */
export const emitPatientAlert = (
  patientId: string,
  payload: Record<string, any>,
) => {
  if (!io) {
    console.warn("Socket.io is not initialized");
    return;
  }

  const room = getPatientRoom(patientId);

  io.to(room).emit("patientAlert", {
    ...payload,
    patientId,
  });

  console.log(payload);

  console.log(`🚨 Alert emitted to ${room}`);
};

/**
 * Notify caregivers that a command was satisfied.
 *
 * SATISFIED is NOT a Command enum value.
 * It is only a Socket/UI event.
 */
export const emitSatisfied = (patientId: string, commandId: string) => {
  if (!io) {
    console.warn("Socket.io is not initialized");
    return;
  }

  const room = getPatientRoom(patientId);

  io.to(room).emit("patientAlert", {
    id: commandId,
    command: "SATISFIED",
    status: "Satisfied",
    patientId,
    recordedAt: new Date().toISOString(),
  });

  console.log(`✅ Satisfied event emitted to ${room}`);
};
