export interface Stream {
  url: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface Session {
  startMs: number;
  durationMs: number;
  streams: Stream[];
}
