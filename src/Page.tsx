import React from "react";
import Player from "./Player";
import { Stream } from "./models";
import { nowMs } from "./now";
import MaterialIcon from "@material/react-material-icon";
import { Button } from "./Button";

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
    <div
      className="page"
      style={{
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Player
        url={url}
        volume={volume}
        startedAtMs={nowMs()}
        // TODO show some indicator on buffering
        onBuffering={() => console.log("buffering")}
        onPlaying={() => console.log("playing")}
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
  );
};

export default Page;
