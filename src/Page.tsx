import React from "react";
import Player from "./Player";
import { Stream } from "./models";
import { nowMs } from "./now";

interface Props {
  volume: number;
  stream: Stream;
  onClickNext: () => void;
  onClickPrev: () => void;
}

const Page: React.FC<Props> = ({
  volume,
  stream: { url, color, title },
  onClickNext,
  onClickPrev,
}) => {
  return (
    <div
      style={{
        backgroundColor: color,
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
      <button onClick={onClickNext}>Next</button>
      <button onClick={onClickPrev}>Previous</button>
      <p>{title}</p>
    </div>
  );
};

export default Page;
