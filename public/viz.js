/******************
Code by Vamoss
Original code link:
https://www.openprocessing.org/sketch/751983
******************/

var blobs = [];
var colors;
let variation;
let xScale, yScale, centerX, centerY;

let lastChange = 0;
let baseColor;

const changeDuration = 10000;
const blobsPerRender = 3;
const speed = 0.001;
const blobLifetime = 3000;
const fadeSpeed = 5;

const hueChange = 5;
const saturationChange = 10;
const brightnessChange = 20;

const variations = [
  { dx: (x, y) => Math.cos(y), dy: (x, y) => Math.sin(x) },
  {
    dx: (x, y) => Math.cos(y * 5) * x * 0.3,
    dy: (x, y) => Math.sin(x * 5) * y * 0.3,
  },
  { dx: (x, y) => 1, dy: (x, y) => Math.cos(x * y) },
  { dx: (x, y) => 1, dy: (x, y) => Math.sin(x) * Math.cos(y) },
  { dx: (x, y) => 1, dy: (x, y) => Math.cos(x) * y * y },
  {
    dx: (x, y) => 1,
    dy: (x, y) => Math.log(Math.abs(x)) * Math.log(Math.abs(y)),
  },
  {
    dx: (x, y) => Math.sin(y * 0.1) * 3,
    dy: (x, y) => -Math.sin(x * 0.1) * 3,
  },
  { dx: (x, y) => y / 3, dy: (x, y) => (x - x * x * x) * 0.01 },
  { dx: (x, y) => -y, dy: (x, y) => -Math.sin(x) },
  { dx: (x, y) => -1.5 * y, dy: (x, y) => -y - Math.sin(1.5 * x) + 0.7 },
  {
    dx: (x, y) => Math.sin(y) * Math.cos(x),
    dy: (x, y) => Math.sin(x) * Math.cos(y),
  },
  {
    dx: (x, y) => y * x * Math.sin(y),
    dy: (x, y) => Math.cos(x * y),
  },
  {
    dx: (x, y) => -x * Math.sin(x),
    dy: (x, y) => y * Math.sin(y),
  },
  {
    dx: (x, y) => x / Math.max(0.2, Math.cos(x - (2 * y) / Math.max(1, x))),
    dy: (x, y) => y / Math.max(0.2, Math.sin(2 * x + (y * y) / Math.max(1, x))),
  },
  {
    dx: (x, y) => Math.cos(x - y + y / Math.max(1, x)),
    dy: (x, y) => Math.sin(x + y - y / Math.max(1, x)),
  },
  {
    dx: (x, y) => Math.cos(x - y + x / Math.max(1, y)),
    dy: (x, y) => Math.sin(x + y - x / Math.max(1, y)),
  },
  {
    dx: (x, y) => Math.cos(x / Math.max(1, y)) * Math.sin(x - y),
    dy: (x, y) => Math.sin(x / Math.max(1, y)),
  },
  {
    dx: (x, y) => Math.sin(x * y),
    dy: (x, y) => Math.cos((x * x) / Math.max(1, y)),
  },
  {
    dx: (x, y) => Math.sin(x + y),
    dy: (x, y) => Math.cos((x * x) / Math.max(1, y)),
  },
  {
    dx: (x, y) => Math.cos(x * x + y * y),
    dy: (x, y) => Math.sin(Math.sqrt(Math.abs(x * y))),
  },
];

function setup() {
  const canvas = createCanvas(window.innerWidth - 5, window.innerHeight - 5);
  canvas.parent("canvasContainer");
  textAlign(CENTER, CENTER);

  colorMode(HSB, 100);
  baseColor = RGBStringToHSB(canvas.parent().style["background-color"]);

  xScale = width / 20;
  yScale = (height / 20) * (width / height);

  centerX = width / 2;
  centerY = height / 2;

  colors = [
    color(
      ...correctHSB([
        baseColor[0],
        baseColor[1] + saturationChange,
        baseColor[2] - brightnessChange,
      ])
    ),
    color(
      ...correctHSB([baseColor[0] - 3 * hueChange, baseColor[1], baseColor[2]])
    ),
    color(
      ...correctHSB([
        baseColor[0] + 2 * hueChange,
        baseColor[1] - saturationChange,
        baseColor[2],
      ])
    ),
    color(
      ...correctHSB([
        baseColor[0] + 2 * hueChange,
        baseColor[1] + saturationChange,
        baseColor[2] + brightnessChange,
      ])
    ),
    color(
      ...correctHSB([
        baseColor[0] + hueChange,
        baseColor[1],
        baseColor[2] + brightnessChange,
      ])
    ),
  ];

  variation = floor(random(0, variations.length));
}

function draw() {
  let time = millis();
  for (let i = 0; i < blobsPerRender; i++) {
    let x = random(0, width);
    let y = random(0, height);
    var blob = {
      x: getXPos(x),
      y: getYPos(y),
      size: random(1, 5),
      lastX: x,
      lastY: y,
      color: colors[floor(random(colors.length))],
      direction: random(0.1, 1) * (random() > 0.5 ? 1 : -1),
      born: time,
    };
    blobs.push(blob);
  }

  noStroke();
  fill(...baseColor, fadeSpeed);
  rect(0, 0, width, height);

  //auto change
  if (time - lastChange > changeDuration) {
    lastChange = time;
    variation = floor(random(0, variations.length));
  }

  var stepsize = deltaTime * speed;
  for (var i = blobs.length - 1; i >= 0; i--) {
    let blob = blobs[i];

    var x = getSlopeX(blob.x, blob.y);
    var y = getSlopeY(blob.x, blob.y);
    blob.x += blob.direction * x * stepsize;
    blob.y += blob.direction * y * stepsize;

    x = getXPrint(blob.x);
    y = getYPrint(blob.y);
    stroke(blob.color);
    strokeWeight(blob.size);
    line(x, y, blob.lastX, blob.lastY);
    blob.lastX = x;
    blob.lastY = y;

    const border = 1000;
    if (
      x < -border ||
      y < -border ||
      x > width + border ||
      y > height + border ||
      time - blob.born > blobLifetime
    ) {
      blobs.splice(i, 1);
    }
  }
}

const getSlopeX = (x, y) => variations[variation].dx(x, y);
const getSlopeY = (x, y) => variations[variation].dy(x, y);

function getXPos(x) {
  return (x - centerX) / xScale;
}
function getYPos(y) {
  return (y - centerY) / yScale;
}

function getXPrint(x) {
  return xScale * x + centerX;
}
function getYPrint(y) {
  return yScale * y + centerY;
}

const RGBStringToHSB = (str) => {
  const [r, g, b] = str.split("(")[1].split(")")[0].split(", ").map(Number);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h;
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

const mod = (n, m) => ((n % m) + m) % m;

const correctHSB = ([h, s, b]) => [
  mod(h, 100),
  mod(s, 100),
  Math.min(Math.max(b, 0), 100),
];
