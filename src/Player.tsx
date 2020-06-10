import * as React from "react";
import ReactPlayer from "react-player";

interface Props {
  url: string;
  volume: number;
}

export default ({ url, volume }: Props) => (
  <ReactPlayer
    onError={console.error}
    url={url}
    playing
    width={0}
    height={0}
    volume={volume}
  />
);
