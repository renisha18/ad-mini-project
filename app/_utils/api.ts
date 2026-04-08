import axios from "axios";

const api = axios.create({
  baseURL: "https://alfa-leetcode-api.onrender.com",
  timeout: 15000,
});

type AnyRecord = Record<string, unknown>;

export type UserProfile = {
  username: string;
  ranking: number;
  totalSolved: number;
};

export type CalendarMap = Record<string, number>;

function toRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

function getFirstNumber(record: AnyRecord, keys: string[]): number {
  for (const key of keys) {
    if (key in record) return toNumber(record[key]);
  }
  return 0;
}

export async function fetchUserProfile(username: string): Promise<UserProfile> {
  const { data } = await api.get(`/${encodeURIComponent(username)}`);
  const record = toRecord(data);
  const solvedData = toRecord(record.solvedProblem ?? record.submitStats);

  const resolvedUsername =
    typeof record.username === "string"
      ? record.username
      : typeof record.userName === "string"
        ? record.userName
        : username;

  const ranking = getFirstNumber(record, ["ranking", "rank"]);
  const totalSolved =
    getFirstNumber(record, ["totalSolved", "solvedProblem", "submitCount"]) ||
    getFirstNumber(solvedData, ["totalSolved", "all", "solvedProblem", "total"]);

  return {
    username: resolvedUsername,
    ranking,
    totalSolved,
  };
}

export async function fetchUserCalendar(username: string): Promise<CalendarMap> {
  const { data } = await api.get(`/${encodeURIComponent(username)}/calendar`);
  const record = toRecord(data);
  const calendar = record.submissionCalendar ?? record.calendar ?? {};

  if (typeof calendar === "string") {
    try {
      const parsed = JSON.parse(calendar) as Record<string, unknown>;
      const out: CalendarMap = {};
      Object.keys(parsed).forEach((key) => {
        out[key] = toNumber(parsed[key]);
      });
      return out;
    } catch {
      return {};
    }
  }

  const calendarRecord = toRecord(calendar);
  const out: CalendarMap = {};
  Object.keys(calendarRecord).forEach((key) => {
    out[key] = toNumber(calendarRecord[key]);
  });
  return out;
}

