export interface Stream {
  url: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface Session {
  startsAt: string;
  durationMs: number;
  streams: Stream[];
}

export type PlayerStatus = "buffering" | "waiting" | "finished" | "playing";
