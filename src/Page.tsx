import React from "react";
import Player from "./Player";
import { Stream } from "./models";
import { nowMs } from "./now";
import MaterialIcon from "@material/react-material-icon";
import { Button } from "./Button";
import Visualization from "./Visualization";

interface Props {
  volume: number;
  stream: Stream;
  onClickNext: () => void;
  onClickPrev: () => void;
}

const Page: React.FC<Props> = ({
  volume,
  stream: { url, color, title, subtitle },
  onClickNext,
  onClickPrev,
}) => {
  return (
    <div id="pageContainer">
      <div id="page">
        <Player
          url={url}
          volume={volume}
          startedAtMs={nowMs()}
          onBuffering={() => console.log("buffering")}
          onPlaying={() => console.log("playing")}
          onWaiting={() => console.log("waiting")}
          onFinished={() => console.log("finished")}
        />
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
          <div>
            <h2>{title}</h2>
          </div>
          <div>
            <h4>{subtitle}</h4>
          </div>
        </div>
        {/* next button */}
        <Button onClick={onClickNext}>
          <MaterialIcon icon="arrow_forward" />
        </Button>
      </div>
      <Visualization color={color} />
    </div>
  );
};

export default Page;
