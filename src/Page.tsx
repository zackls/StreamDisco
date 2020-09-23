import React from "react";
import Player from "./Player";
import { Stream, PlayerStatus } from "./models";
import { nowMs } from "./now";
import MaterialIcon from "@material/react-material-icon";
import { Button } from "./Button";
import Visualization from "./Visualization";
import moment from "moment";
import { DEBUG_STARTS_ON_REFRESH, DEBUG_PLAYER_LOGGING } from "./debug";

interface Props {
  volume: number;
  stream: Stream;
  onClickNext: () => void;
  onClickPrev: () => void;
  startsAtMs: number;
}

interface State {
  status: PlayerStatus;
  playerLag: number;
}

class Page extends React.Component<Props, State> {
  startsAtMs: number;

  constructor(props: Props) {
    super(props);

    this.startsAtMs = DEBUG_STARTS_ON_REFRESH ? nowMs() : this.props.startsAtMs;

    this.state = { status: "waiting for user input", playerLag: 0 };
  }

  render() {
    const {
      volume,
      stream: { url, color, title, subtitle },
      onClickNext,
      onClickPrev,
    } = this.props;

    let centerComponent = null;
    const now = nowMs();
    if (this.state.status === "finished") {
      centerComponent = (
        <div>
          <h4>Thanks for listening :)</h4>
        </div>
      );
    } else if (this.state.status === "waiting for user input") {
      centerComponent = (
        <Button onClick={() => this.setState({ status: "waiting to load" })}>
          <h2>Start Listening</h2>
        </Button>
      );
    } else if (now < this.startsAtMs) {
      // rerender in a second to refresh the time
      setTimeout(() => {
        this.forceUpdate();
      }, 1000);
      centerComponent = (
        <div>
          <h4>Starting {moment(this.startsAtMs).fromNow()}</h4>
        </div>
      );
    } else {
      centerComponent = (
        <>
          <div>
            <h2>{title}</h2>
          </div>
          <div>
            <h4>{subtitle}</h4>
          </div>
        </>
      );
    }

    return (
      <div id="pageContainer">
        <div id="page">
          {this.state.status !== "waiting for user input" && (
            <Player
              url={url}
              volume={volume}
              startsAtMs={this.startsAtMs}
              onBuffering={() => {
                this.setState({
                  status: "buffering",
                });
              }}
              onPlaying={() => {
                this.setState({
                  status: "playing",
                });
              }}
              onWaiting={() => {
                this.setState({
                  status: "waiting to load",
                });
              }}
              onFinished={() => {
                this.setState({
                  status: "finished",
                });
              }}
              onRecordLag={(lag) => {
                this.setState({
                  playerLag: lag,
                });
              }}
            />
          )}
          {/* prev button */}
          <Button onClick={onClickPrev}>
            <MaterialIcon icon="arrow_back" />
          </Button>
          <div
            style={{
              margin: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {centerComponent}
            {DEBUG_PLAYER_LOGGING && `Lag: ${this.state.playerLag}`}
          </div>
          {/* next button */}
          <Button onClick={onClickNext}>
            <MaterialIcon icon="arrow_forward" />
          </Button>
        </div>
        <Visualization color={color} status={this.state.status} />
      </div>
    );
  }
}

export default Page;
