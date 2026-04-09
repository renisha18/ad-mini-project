import axios from "axios";

const api = axios.create({
  baseURL: "https://alfa-leetcode-api.onrender.com",
  timeout: 15000,
});

type AnyRecord = Record<string, unknown>;

export type LeetCodeStats = {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  totalSubmissions: number;
};

export type CalendarData = Record<string, number>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function firstNumber(rec: AnyRecord, keys: string[]): number {
  for (const key of keys) {
    if (key in rec) return toNumber(rec[key]);
  }
  return 0;
}

export async function fetchUserStats(username: string): Promise<LeetCodeStats> {
  // 1. Get solved stats (accurate)
  const { data: solvedData } = await api.get(`/${encodeURIComponent(username)}/solved`);
  const solved = asRecord(solvedData);

  // 2. Get general stats (ranking, acceptance)
  const { data: userData } = await api.get(`/${encodeURIComponent(username)}`);
  const user = asRecord(userData);

  const easySolved = toNumber(solved.easySolved ?? solved.easy);
  const mediumSolved = toNumber(solved.mediumSolved ?? solved.medium);
  const hardSolved = toNumber(solved.hardSolved ?? solved.hard);

  const totalSolved =
    toNumber(solved.totalSolved) || easySolved + mediumSolved + hardSolved;

  return {
    username:
      (typeof user.username === "string"
        ? user.username
        : typeof user.userName === "string"
        ? user.userName
        : username).trim(),

    ranking: toNumber(user.ranking ?? user.rank),

    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,

    acceptanceRate: toNumber(user.acceptanceRate),

    totalSubmissions: toNumber(user.totalSubmissions),
  };
}

export async function fetchCalendar(username: string): Promise<CalendarData> {
  const { data } = await api.get(`/${encodeURIComponent(username)}/calendar`);
  const rec = asRecord(data);
  const calendarCandidate = rec.submissionCalendar ?? rec.calendar ?? {};

  if (typeof calendarCandidate === "string") {
    try {
      const parsed = JSON.parse(calendarCandidate) as Record<string, unknown>;
      const out: CalendarData = {};
      Object.keys(parsed).forEach((k) => {
        out[k] = toNumber(parsed[k]);
      });
      return out;
    } catch {
      return {};
    }
  }

  const calendar = asRecord(calendarCandidate);
  const out: CalendarData = {};
  Object.keys(calendar).forEach((k) => {
    out[k] = toNumber(calendar[k]);
  });
  return out;
}

export function getTodayKey(): string {
  return String(Math.floor(Date.now() / 1000 / 86400) * 86400);
}

