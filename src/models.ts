export interface Stream {
  url: string;
  title: string;
  color: string;
}

export interface Session {
  startMs: number;
  durationMs: number;
  streams: Stream[];
}
