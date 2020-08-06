// @ts-ignore
import P5Wrapper from "react-p5-wrapper";

import React from "react";
import p5 from "p5";
import { mod } from "./util";
import { PlayerStatus } from "./models";

interface Props {
  color: string;
  status: PlayerStatus;
}

type HSB = number[];

interface Blob {
  x: number;
  y: number;
  size: number;
  lastX: number;
  lastY: number;
  color: p5.Color;
  direction: number;
  born: number;
}

// helpful to define cause it comes up often
type TwoVariableFunction = (x: number, y: number) => number;
interface Variation {
  dx: TwoVariableFunction;
  dy: TwoVariableFunction;
}

function sketch(p: p5) {
  /******************
  Code by Vamoss
  Original code link:
  https://www.openprocessing.org/sketch/751983
  ******************/

  const blobs: Blob[] = [];
  let colors: p5.Color[];
  let variation: Variation;
  let variationOverride: Variation | undefined;
  let xScale: number;
  let yScale: number;
  let centerX: number;
  let centerY: number;

  let lastChange = 0;
  let baseColor: HSB;
  let status: PlayerStatus = "finished";

  const changeDuration = 10000;
  const blobsPerRender = 3;
  const speed = 0.001;
  const blobLifetime = 3000;
  const fadeSpeed = 4;

  const hueChange = 15;
  const saturationChange = 10;
  const brightnessChange = 10;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const variations: Variation[] = [
    {
      dx: (x, y) => Math.cos(y * 5) * x * 0.3,
      dy: (x, y) => Math.sin(x * 5) * y * 0.3,
    },
    {
      dx: (x, y) => 0.5 * x * Math.cos(y * x),
      dy: (x, y) => 0.5 * y * Math.sin(x * x),
    },
    { dx: (x, y) => 1, dy: (x, y) => Math.cos(x * y) },
    { dx: (x, y) => Math.sin(x) * Math.cos(y), dy: (x, y) => 1 },
    {
      dx: (x, y) => 1,
      dy: (x, y) => Math.log(Math.abs(x)) * Math.log(Math.abs(y)),
    },
    {
      dx: (x, y) => 3 * Math.sin(y * 0.1),
      dy: (x, y) => -3 * Math.sin(x * 0.1),
    },
    { dx: (x, y) => -y, dy: (x, y) => -Math.sin(x) },
    { dx: (x, y) => -1.5 * y, dy: (x, y) => -y - Math.sin(1.5 * x) + 0.7 },
    {
      dx: (x, y) => 0.5 * y * x * Math.sin(y),
      dy: (x, y) => Math.cos(x * y),
    },
    {
      dx: (x, y) => 0.5 * y * Math.sin(x),
      dy: (x, y) => y * Math.cos(x * x),
    },
    {
      dx: (x, y) => 0.5 * y * Math.sin(y) - x,
      dy: (x, y) => y * Math.cos(x * y),
    },
    {
      dx: (x, y) => 0.5 * x * Math.sin(x) - y,
      dy: (x, y) => x * Math.cos(x * y),
    },
    {
      dx: (x, y) => 2 * Math.cos(x - y + y / Math.max(1, x)),
      dy: (x, y) => 2 * Math.sin(x + y - y / Math.max(1, x)),
    },
    {
      dx: (x, y) => 2 * Math.cos(x / Math.max(1, y)) * Math.sin(x - y),
      dy: (x, y) => 2 * Math.sin(x / Math.max(1, y)),
    },
    {
      dx: (x, y) => 2 * Math.sin(x * y),
      dy: (x, y) => 2 * Math.cos((x * x) / Math.max(1, y)),
    },
    {
      dx: (x, y) => 2 * Math.sin(y * y),
      dy: (x, y) => 2 * Math.cos((y * x) / Math.max(1, Math.sin(x))),
    },
    {
      dx: (x, y) => 2 * Math.sin(x * y),
      dy: (x, y) => 2 * Math.cos((y * y) / Math.max(1, x * x)),
    },
    {
      dx: (x, y) => 2 * Math.sin(x * y - x * x),
      dy: (x, y) => 2 * Math.cos((x * x) / Math.max(1, y * y)),
    },
    {
      dx: (x, y) => 2 * Math.sin(x + y),
      dy: (x, y) => 2 * Math.cos((x * x) / Math.max(1, y)),
    },
    {
      dx: (x, y) => 2 * Math.cos(x * x + y * y),
      dy: (x, y) => 2 * Math.sin(Math.sqrt(Math.abs(x * y))),
    },
    {
      dx: (x, y) => 3 * Math.sin(x - y),
      dy: (x, y) => 3 * Math.cos((x * y) / Math.max(1, y)),
    },
    {
      dx: (x, y) => 0.25 * x - y * y,
      dy: (x, y) => Math.sqrt(Math.abs(x)),
    },
    {
      dx: (x, y) => 0.5 * Math.sqrt(x * x + y * y),
      dy: (x, y) => 1,
    },
    {
      dx: (x, y) => 2 * Math.cos(x + y),
      dy: (x, y) => 2 * Math.sqrt(Math.abs(y / x)),
    },
  ];
  const bufferingVariation: Variation = {
    dx: (x, y) => 2.5 * Math.cos(y),
    dy: (x, y) => 2.5 * Math.sin(x),
  };
  const waitingVariation: Variation = {
    dx: (x, y) => p.random() * Math.cos(10 * y),
    dy: (x, y) => p.random() * Math.sin(10 * x),
  };

  (p as any).myCustomRedrawAccordingToNewPropsHandler = (props: Props) => {
    p.colorMode(p.HSB, 100);
    if (props.color) {
      baseColor = HexStringToHSB(props.color);
      colors = [
        p.color(
          correctHSB([
            baseColor[0],
            baseColor[1] + saturationChange,
            baseColor[2] - 2 * brightnessChange,
          ])
        ),
        p.color(
          correctHSB([baseColor[0] + 4 * hueChange, baseColor[1], baseColor[2]])
        ),
        p.color(
          correctHSB([
            baseColor[0] + 5 * hueChange,
            baseColor[1] - saturationChange,
            baseColor[2],
          ])
        ),
        p.color(
          correctHSB([
            baseColor[0] + 2 * hueChange,
            baseColor[1] + saturationChange,
            baseColor[2] + brightnessChange,
          ])
        ),
        p.color(
          correctHSB([
            baseColor[0] + hueChange,
            baseColor[1],
            baseColor[2] + brightnessChange,
          ])
        ),
      ];
    }
    status = props.status;
  };

  p.setup = () => {
    p.createCanvas(width, height);
    p.textAlign(p.CENTER, p.CENTER);

    xScale = p.width / 20;
    yScale = (p.height / 20) * (p.width / p.height);

    centerX = width / 2;
    centerY = height / 2;

    variation = variations[p.floor(p.random(0, variations.length))];
  };

  p.draw = () => {
    let time = p.millis();
    advanceVariation(time);
    spawn(time);
    drawBackground();
    moveBlobs(time);
  };

  // helpers
  const advanceVariation = (time: number) => {
    if (time - lastChange > changeDuration) {
      lastChange = time;
      variation = variations[p.floor(p.random(0, variations.length))];
    }
  };
  const spawn = (time: number) => {
    if (status === "playing") {
      for (let i = 0; i < blobsPerRender; i++) {
        let x = p.random(0, width);
        let y = p.random(0, height);
        blobs.push({
          x: getXPos(x),
          y: getYPos(y),
          size: p.random(1, 5),
          lastX: x,
          lastY: y,
          color: colors[p.floor(p.random(colors.length))],
          direction: p.random(0.1, 1),
          born: time,
        });
      }
    } else if (status === "buffering") {
      let x = width / 2;
      let y = height / 2 + 100;
      blobs.push({
        x: getXPos(x),
        y: getYPos(y),
        size: p.random(1, 5),
        lastX: x,
        lastY: y,
        color: colors[p.floor(p.random(colors.length))],
        direction: p.random(0.1, 1),
        born: time,
      });
    } else if (status === "waiting") {
      let x = mod(p.floor(time / 1000), 3) * 100 - 100 + width / 2;
      let y = height / 2 + 100;
      if (p.random() < 0.05) {
        x = p.random(0, width);
        y = p.random(0, height);
      }
      blobs.push({
        x: getXPos(x),
        y: getYPos(y),
        size: p.random(1, 5),
        lastX: x,
        lastY: y,
        color: colors[p.floor(p.random(colors.length))],
        direction: p.random(0.1, 1),
        born: time,
      });
    } else if (status === "finished") {
      // currently no animation on finished, maybe eventually a smiley face or
      // something?
      return;
    }
  };
  const drawBackground = () => {
    p.noStroke();
    p.fill(baseColor[0], baseColor[1], baseColor[2], fadeSpeed);
    p.rect(0, 0, width, height);
  };
  const moveBlobs = (time: number) => {
    if (status === "buffering") {
      variationOverride = bufferingVariation;
    } else if (status === "waiting") {
      variationOverride = waitingVariation;
    } else if (status === "finished") {
      return;
    } else {
      variationOverride = undefined;
    }
    const stepsize = p.deltaTime * speed;
    for (let i = blobs.length - 1; i >= 0; i--) {
      let blob = blobs[i];

      let x = getSlopeX(blob.x, blob.y);
      let y = getSlopeY(blob.x, blob.y);
      blob.x += blob.direction * x * stepsize;
      blob.y += blob.direction * y * stepsize;

      x = getXPrint(blob.x);
      y = getYPrint(blob.y);
      p.stroke(blob.color);
      p.strokeWeight(blob.size);
      p.line(x, y, blob.lastX, blob.lastY);
      blob.lastX = x;
      blob.lastY = y;

      if (time - blob.born > blobLifetime) {
        blobs.splice(i, 1);
      }
    }
  };
  const getSlopeX: TwoVariableFunction = (x, y) =>
    (variationOverride || variation).dx(x, y);
  const getSlopeY: TwoVariableFunction = (x, y) =>
    (variationOverride || variation).dy(x, y);
  const getXPos = (x: number) => (x - centerX) / xScale;
  const getYPos = (y: number) => (y - centerY) / yScale;
  const getXPrint = (x: number) => xScale * x + centerX;
  const getYPrint = (y: number) => yScale * y + centerY;
  const HexStringToRGBString = (str: string) => {
    let r = 0,
      g = 0,
      b = 0;
    if (str.length === 4) {
      r = Number("0x" + str[1] + str[1]);
      g = Number("0x" + str[2] + str[2]);
      b = Number("0x" + str[3] + str[3]);
    } else if (str.length === 7) {
      r = Number("0x" + str[1] + str[2]);
      g = Number("0x" + str[3] + str[4]);
      b = Number("0x" + str[5] + str[6]);
    }
    return `rgb(${r}, ${g}, ${b})`;
  };
  const RGBStringToHSB = (str: string): HSB => {
    const [r, g, b] = str.split("(")[1].split(")")[0].split(", ").map(Number);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    let s = max === 0 ? 0 : d / max;
    let v = max / 255;
    switch (max) {
      case min:
        h = 0;
        break;
      case r:
        h = g - b + d * (g < b ? 6 : 0);
        h /= 6 * d;
        break;
      case g:
        h = b - r + d * 2;
        h /= 6 * d;
        break;
      case b:
        h = r - g + d * 4;
        h /= 6 * d;
        break;
    }
    return [h * 100, s * 100, v * 100];
  };
  const HexStringToHSB = (str: string) =>
    RGBStringToHSB(HexStringToRGBString(str));
  const correctHSB = ([h, s, b]: HSB): HSB => [
    mod(h, 100),
    mod(s, 100),
    Math.min(Math.max(b, 0), 100),
  ];
}

const Visualization: React.FC<Props> = ({ color, status }) => (
  <div
    id="canvasContainer"
    style={{ backgroundColor: color, overflow: "hidden" }}
  >
    <P5Wrapper sketch={sketch} color={color} status={status} />
  </div>
);

export default Visualization;
