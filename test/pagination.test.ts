import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRepository } from "@/repositories/command.repository";
import { VitalsRepository } from "@/repositories/vitals-history.repository";
import { GetAllCommandService } from "@/services/command/get-all-commands";
import { GetVitalsHistoryService } from "@/services/device/get-full-vitals-history";
import { parsePagination } from "@/utils/pagination";

const pagination = (page = 1, limit = 20) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});

test("pagination defaults and custom values", () => {
  assert.deepEqual(parsePagination({}), pagination());
  assert.deepEqual(
    parsePagination({ page: "3", limit: "10" }),
    pagination(3, 10),
  );
});

test("invalid page and limit values are rejected", () => {
  assert.equal("error" in parsePagination({ page: "0" }), true);
  assert.equal("error" in parsePagination({ page: "1.5" }), true);
  assert.equal("error" in parsePagination({ limit: "0" }), true);
  assert.equal("error" in parsePagination({ limit: "101" }), true);
  assert.equal("error" in parsePagination({ limit: "abc" }), true);
});

test("commands use one authorized where clause for page and count", async () => {
  let findArgs: any;
  let countArgs: any;
  const database = {
    commands: {
      findMany: async (args: any) => {
        findArgs = args;
        return [];
      },
      count: async (args: any) => {
        countArgs = args;
        return 85;
      },
    },
  };
  const repository = new CommandRepository(database as any);

  const result = await repository.findAll("non-patient-1", pagination(2, 20));

  assert.deepEqual(result, { data: [], totalItems: 85 });
  assert.equal(findArgs.skip, 20);
  assert.equal(findArgs.take, 20);
  assert.deepEqual(findArgs.orderBy, { recordedAt: "desc" });
  assert.deepEqual(findArgs.select, {
    id: true,
    command: true,
    status: true,
    recordedAt: true,
  });
  assert.deepEqual(findArgs.where, countArgs.where);
  assert.deepEqual(findArgs.where, {
    nonPatientId: "non-patient-1",
    patient: {
      patientConnections: {
        some: {
          nonPatientId: "non-patient-1",
          status: "CONNECTED",
        },
      },
    },
  });
});

test("vitals use accessible devices and the same where for page and count", async () => {
  let connectionArgs: any;
  let findArgs: any;
  let countArgs: any;
  const database = {
    commands: {
      findMany: async (args: any) => {
        connectionArgs = args;
        return [{ deviceId: "device-1" }, { deviceId: null }];
      },
    },
    vitalReadings: {
      findMany: async (args: any) => {
        findArgs = args;
        return [];
      },
      count: async (args: any) => {
        countArgs = args;
        return 0;
      },
    },
  };
  const repository = new VitalsRepository(database as any);

  const result = await repository.get("non-patient-1", pagination(3, 5));

  assert.deepEqual(result, { data: [], totalItems: 0 });
  assert.deepEqual(findArgs.where, countArgs.where);
  assert.deepEqual(findArgs.where, { deviceId: { in: ["device-1"] } });
  assert.deepEqual(connectionArgs.where, {
    nonPatientId: "non-patient-1",
    patient: {
      patientConnections: {
        some: {
          nonPatientId: "non-patient-1",
          status: "CONNECTED",
        },
      },
    },
  });
  assert.equal(findArgs.skip, 10);
  assert.equal(findArgs.take, 5);
  assert.deepEqual(findArgs.orderBy, { recordedAt: "desc" });
  assert.deepEqual(findArgs.select, {
    id: true,
    deviceId: true,
    heartRate: true,
    temperature: true,
    sensorContact: true,
    recordedAt: true,
  });
});

test("services calculate totals and navigation for an empty page", async (t) => {
  t.mock.method(CommandRepository.prototype, "findAll", async () => ({
    data: [],
    totalItems: 85,
  }));
  t.mock.method(VitalsRepository.prototype, "get", async () => ({
    data: [],
    totalItems: 0,
  }));

  const commands = await GetAllCommandService(
    "non-patient-1",
    pagination(5, 20),
  );
  const vitals = await GetVitalsHistoryService("non-patient-1", pagination());

  assert.deepEqual(commands.pagination, {
    page: 5,
    limit: 20,
    totalItems: 85,
    totalPages: 5,
    hasNext: false,
    hasPrevious: true,
  });
  assert.deepEqual(vitals.pagination, {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  assert.deepEqual(commands.data, []);
  assert.deepEqual(vitals.data, []);
});
