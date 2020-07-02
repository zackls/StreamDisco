import React from "react";

interface Props {
  color: string;
}

// TODO use a react p5 tool to trigger updates to the visualization properly
const Visualization: React.FC<Props> = ({ color }) => (
  <div
    id="canvasContainer"
    key={color}
    style={{ backgroundColor: color }}
  ></div>
);

export default Visualization;
