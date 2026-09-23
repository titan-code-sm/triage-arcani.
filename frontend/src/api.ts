// Backend API client. The backend URL comes from EXPO_PUBLIC_BACKEND_URL
// (frontend/.env); every API route is prefixed with /api.

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export function apiUrl(path: string): string {
  return `${BACKEND_URL}${path}`;
}

export function cardImageUrl(idx: number): string {
  return `${BACKEND_URL}/api/cards/${idx}/image`;
}

export interface CardDto {
  idx: number;
  name: string;
  atk: number;
  def: number;
  effect: string;
  rarity: "normale" | "epocale";
  flavor: string;
  scene: string;
}

export interface DuelRecordDto {
  id?: string;
  device_id: string;
  opponent: string;
  mode: string;
  difficulty: string;
  result: "vittoria" | "sconfitta" | "pareggio";
  turns: number;
  lp_player: number;
  lp_opponent: number;
  created_at: string;
}

export interface DuelStatsDto {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winrate: number;
  by_difficulty: Record<string, { wins: number; losses: number }>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status} su ${path}`);
  return (await res.json()) as T;
}

export function fetchCards(): Promise<CardDto[]> {
  return request<CardDto[]>("/api/cards");
}

export function fetchDuels(deviceId: string): Promise<DuelRecordDto[]> {
  return request<DuelRecordDto[]>(`/api/duels/${encodeURIComponent(deviceId)}`);
}

export function fetchStats(deviceId: string): Promise<DuelStatsDto> {
  return request<DuelStatsDto>(`/api/stats/${encodeURIComponent(deviceId)}`);
}

export function postDuel(record: Omit<DuelRecordDto, "id" | "created_at">): Promise<DuelRecordDto> {
  return request<DuelRecordDto>("/api/duels", {
    method: "POST",
    body: JSON.stringify(record),
  });
}
