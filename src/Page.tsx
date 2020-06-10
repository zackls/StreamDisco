import React from "react";
import Player from "./Player";
import { Stream } from "./models";

interface Props {
  volume: number;
  stream: Stream;
  onClickNext: () => void;
  onClickPrev: () => void;
}

// its ugly i know, ill make it sparkle later
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
      <Player url={url} volume={volume} />
      <header>
        <button onClick={onClickNext}>Next</button>
        <button onClick={onClickPrev}>Previous</button>
        <p>{title}</p>
      </header>
    </div>
  );
};

export default Page;
