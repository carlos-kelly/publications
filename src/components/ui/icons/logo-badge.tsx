import React from "react";
import posed from "react-pose";

const SouthwestAnglePath = posed.path({
  end: {
    opacity: 1,
    transform: "translate(0, 0)",
    transition: { delay: 500, duration: 1000, ease: "anticipate" },
  },
  start: { opacity: 0, transform: "translate(10, -10)" },
});

const NortheastAnglePath = posed.path({
  end: {
    opacity: 1,
    transform: "translate(0, 0)",
    transition: { delay: 500, duration: 1000, ease: "anticipate" },
  },
  start: { opacity: 0, transform: "translate(-10, 10)" },
});

const SlidingArmRect = posed.rect({
  end: {
    height: 62,
    transition: { delay: 1100, type: "spring", stiffness: 70 },
  },
  start: { height: 0 },
});

interface Props {
  size?: number;
  backgroundColor?: string;
}
const LogoBadge: React.FunctionComponent<Props> = props => {
  const [startAnimation, setStartAnimation] = React.useState(false);
  React.useEffect(() => {
    setStartAnimation(true);
    return () => setStartAnimation(false);
  });
  const size = props.size || 120;
  const backgroundColor = props.backgroundColor || "#2C2D30";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <SlidingArmRect
          pose={startAnimation ? "end" : "start"}
          fill="#fcf953"
          transform="rotate(225 43.517 26.517)"
          x="39.517"
          y="-6.983"
          rx={1}
          ry={1}
          width="8"
          height="67"
        />
        <NortheastAnglePath
          pose={startAnimation ? "end" : "start"}
          d="M1,12 L1,23 L47,23 L47,69 L58,69 L58,12 L1,12 Z"
          stroke={backgroundColor}
          strokeWidth="2"
          fill="#fff"
        />
        <SouthwestAnglePath
          pose={startAnimation ? "end" : "start"}
          d="M66,61 L66,50 L20,50 L20,4 L9,4 L9,61 L66,61 Z"
          stroke={backgroundColor}
          strokeWidth="2"
          fill="#fff"
        />
      </g>
    </svg>
  );
};

export default LogoBadge;
