import React from "react";
import Player from "./Player";
import { Stream } from "./models";
import Slider from "react-slider";

interface Props {
  volume: number;
  stream: Stream;
  onClickNext: () => void;
  onClickPrev: () => void;
  onChangeVolume: (volume: number) => void;
}

// its ugly i know, ill make it sparkle later
const Page: React.FC<Props> = ({
  volume,
  stream: { url, color, title },
  onClickNext,
  onClickPrev,
  onChangeVolume,
}) => {
  return (
    <div
      style={{
        backgroundColor: color,
      }}
    >
      <Player url={url} volume={volume} />
      <button onClick={onClickNext}>Next</button>
      <button onClick={onClickPrev}>Previous</button>
      <p>{title}</p>
      <Slider
        className="page-slider"
        trackClassName="page-slider-track"
        thumbClassName="page-slider-thumb"
        value={volume}
        onChange={(val) => onChangeVolume(val as number)}
        min={0}
        max={1}
        step={0.1}
      ></Slider>
    </div>
  );
};

export default Page;
