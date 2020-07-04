import * as React from "react";
import ReactPlayer from "react-player";
import { nowMs } from "./now";

const DEBUG = true;

export const STREAM_OFFSET_TOLERANCE_MS = 100;
export const CATCHUP_WINDOW_INITIAL_MS = 1000;
export const CATCHUP_WINDOW_BACKOFF = 1.5;
export const CATCHUP_WINDOW_RECOVERY = 0.5;

interface SyncValue {
  firedAtMs: number;
  seekS: number;
}

interface Props {
  url: string;
  volume: number;
  startsAtMs: number;
  onPlaying: () => void;
  onBuffering: () => void;
  onWaiting: () => void;
  onFinished: () => void;
  playerRef?: React.RefObject<ReactPlayer>;
}

interface State {
  playing: boolean;
  currentSeek: SyncValue;
  catchupWindowMs: number;
  durationS?: number;
}

// this is necessary since we only get progress events every second, but need
// millisecond precision, so we compare nowMs to when that event was fired to
// assume the millisecond seek
const getSeekMs = ({ firedAtMs, seekS }: SyncValue) =>
  nowMs() - firedAtMs + seekS * 1000;

class Player extends React.Component<Props, State> {
  public playerRef: React.RefObject<ReactPlayer>;

  constructor(props: Props) {
    super(props);

    this.playerRef = props.playerRef || React.createRef<ReactPlayer>();

    this.state = {
      playing: false,
      // i wonder if this even needs to live on state? it's only read in callbacks
      currentSeek: {
        firedAtMs: nowMs(),
        seekS: (nowMs() - props.startsAtMs) / 1000,
      },
      catchupWindowMs: CATCHUP_WINDOW_INITIAL_MS,
    };
  }

  componentDidMount() {
    if (this.state.currentSeek.seekS >= 0) {
      if (DEBUG)
        console.warn(
          "componentDidMount - we should have already started, starting now!"
        );
      this.playerRef.current?.seekTo(this.state.currentSeek.seekS, "seconds");
    } else {
      if (DEBUG)
        console.warn(
          "componentDidMount - starting in the future, waiting til then"
        );
      this.props.onWaiting();
      setTimeout(() => {
        this.setState({ playing: true });
      }, -this.state.currentSeek.seekS * 1000);
    }
  }

  render() {
    const {
      url,
      volume,
      startsAtMs,
      onPlaying,
      onBuffering,
      onFinished,
    } = this.props;
    const { playing, currentSeek, catchupWindowMs } = this.state;
    if (
      this.state.durationS &&
      this.state.durationS < (nowMs() - startsAtMs) / 1000
    ) {
      if (playing) {
        if (DEBUG) console.warn("render - ending the stream unconventionally");
        onFinished();
        // generally setting state within render is a big bad idea, but im making
        // an exception here since the player itself doesnt seem to know to stop
        // if weve seeked past the song duration
        this.setState({
          playing: false,
        });
      }
      return null;
    }
    return (
      <ReactPlayer
        onDuration={(durationS) => this.setState({ durationS })}
        onEnded={onFinished}
        ref={this.playerRef}
        onError={console.error}
        url={url}
        playing={playing}
        width={0}
        height={0}
        volume={volume}
        onProgress={({ playedSeconds: seekS }) => {
          this.setState({
            currentSeek: {
              firedAtMs: nowMs(),
              seekS,
            },
          });
        }}
        onBuffer={() => {
          if (DEBUG) console.warn("onBuffer");
          this.setState({
            playing: false,
          });
          onBuffering();
        }}
        onReady={() => {
          const expectedSeekMs = nowMs() - startsAtMs;
          const currentSeekMs = getSeekMs(currentSeek);
          if (currentSeekMs - expectedSeekMs > STREAM_OFFSET_TOLERANCE_MS) {
            if (DEBUG)
              console.warn(
                "onReady - ready to play, waiting til the correct time"
              );
            // if we're outside our tolerance in the positive direction (we've
            // seeked into the future and are ready) simply wait
            setTimeout(() => {
              this.setState({
                playing: true,
                currentSeek: {
                  seekS: expectedSeekMs / 1000,
                  firedAtMs: expectedSeekMs,
                },
                // lower catchup window, if it was increased
                catchupWindowMs: Math.max(
                  CATCHUP_WINDOW_INITIAL_MS,
                  catchupWindowMs * CATCHUP_WINDOW_RECOVERY
                ),
              });
            }, currentSeekMs - expectedSeekMs);
          } else if (
            currentSeekMs - expectedSeekMs <
            -STREAM_OFFSET_TOLERANCE_MS
          ) {
            if (DEBUG) console.warn("onReady - we've lagged behind, seeking");
            // if we're outside our tolerance in the negative direction (we
            // haven't loaded enough), we need to seek into the future to try to
            // catch up to the current time
            this.playerRef.current?.seekTo(
              (expectedSeekMs + catchupWindowMs) / 1000,
              "seconds"
            );
            // increase the catchup window in hopes that seeking further into
            // the future will help
            if (DEBUG)
              console.warn(
                `onReady - upping catchup window to ${catchupWindowMs}`
              );
            this.setState({
              catchupWindowMs: catchupWindowMs * CATCHUP_WINDOW_BACKOFF,
            });
          } else if (this.state.currentSeek.seekS >= 0) {
            if (DEBUG) console.warn("onReady - good to go!");
            // if we're within tolerance, start playing!
            this.setState({
              playing: true,
              // lower catchup window, if it was increased
              catchupWindowMs: Math.max(
                CATCHUP_WINDOW_INITIAL_MS,
                catchupWindowMs * CATCHUP_WINDOW_RECOVERY
              ),
            });
          }
        }}
        onStart={() => {
          if (DEBUG) console.warn("onPlaying");
          onPlaying();
        }}
      />
    );
  }
}

export default Player;
