"use client";

import type {
  PracticalSafetyCheckState,
  PracticalWorkStatus,
} from "@/lib/domain/practical-execution-types";

const DATABASE_NAME = "seolbi-practical-work";
const DATABASE_VERSION = 1;
const STORE_NAME = "task-records";

export type StoredPracticalSafetyCheck = {
  state: PracticalSafetyCheckState;
  reason: string;
  checkedAt: string | null;
};

export type StoredPracticalWorkRecord = {
  key: string;
  taskId: string;
  taskVersion: number;
  acceptanceRuleVersion: number;
  safetyGateVersion: number;
  status: PracticalWorkStatus;
  safetyChecks: Record<string, StoredPracticalSafetyCheck>;
  completedStepIds: string[];
  measurementValues: Record<string, string>;
  recordFieldValues: Record<string, string>;
  selfAssessment: "" | "independent" | "assisted" | "retry";
  notes: string;
  startedAt: string | null;
  completedAt: string | null;
  abandonedAt: string | null;
  updatedAt: string;
};

export function practicalWorkRecordKey(taskId: string, taskVersion: number) {
  return `${taskId}:v${taskVersion}`;
}

export async function loadPracticalWorkRecord(
  taskId: string,
  taskVersion: number,
): Promise<StoredPracticalWorkRecord | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(
      practicalWorkRecordKey(taskId, taskVersion),
    );
    request.onsuccess = () =>
      resolve((request.result as StoredPracticalWorkRecord | undefined) ?? null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function savePracticalWorkRecord(
  record: StoredPracticalWorkRecord,
): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export async function deletePracticalWorkRecord(
  taskId: string,
  taskVersion: number,
): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(
      practicalWorkRecordKey(taskId, taskVersion),
    );
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("이 브라우저는 작업기록 저장소를 지원하지 않습니다."));
      return;
    }
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
