import * as D3 from "d3";
import { FC } from "react";
import { animated, config, useSpring } from "react-spring";
import colors from "../../colors";

export type GaugeGradientFill = "orange" | "blue";

type GaugeSvgProps = {
  gradientFill?: GaugeGradientFill;
  innerRadius?: number;
  matteFill?: string;
  needleColor?: string;
  progress: number;
};

const GaugeSvg: FC<GaugeSvgProps> = ({
  innerRadius = 80,
  progress = 0,
  matteFill: progressFillColor,
  gradientFill: gradientFillColor,
  needleColor = "white",
}) => {
  const { x } = useSpring({
    from: { x: 0 },
    to: { x: progress },
    delay: 200,
    config: config.gentle,
  });

  const fillColor =
    progressFillColor !== undefined
      ? progressFillColor
      : gradientFillColor !== undefined
      ? `url(#${gradientFillColor}-gradient)`
      : colors.spindle;

  const thickness = 8;
  const width = 2 * (innerRadius + thickness);
  const height = 2 * (innerRadius + thickness);
  const tau = 2 * Math.PI;
  const arcFraction = 2 / 3;
  const arcStartAngle = (-1 / 3) * tau;
  const arcBase = {
    innerRadius: innerRadius,
    outerRadius: innerRadius + thickness,
    startAngle: -tau / 3,
  };

  // cornerRadius has no effect when passed declaratively.
  const backgroundArc = D3.arc().cornerRadius(thickness)({
    ...arcBase,
    endAngle: arcStartAngle + arcFraction * tau,
  });

  const foregroundArc = x.to(
    (x) =>
      D3.arc().cornerRadius(thickness)({
        ...arcBase,
        endAngle: arcStartAngle + arcFraction * tau * x,
      }) ?? "",
  );

  const needlePath = "M 0 -4 L 64 0 L 64 0 L 0 4 A 1 1 0 0 1 0 -4";

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient y1="1" id="orange-gradient">
          <stop offset="00%" stopColor="#EDDB36" />
          <stop offset="60%" stopColor="#E79800" />
        </linearGradient>
        <linearGradient id="blue-gradient">
          <stop offset="0%" stopColor="#5DECD2" />
          <stop offset="100%" stopColor="#5DADEC" />
        </linearGradient>
      </defs>
      <g transform={`translate(${width / 2},${height / 2})`}>
        <path
          style={{ fill: colors.dusk }}
          d={backgroundArc ?? undefined}
        ></path>
        <animated.path d={foregroundArc} fill={fillColor}></animated.path>
        <animated.path
          transform={x.to((x) => `rotate(${-210 + x * arcFraction * 360})`)}
          style={{ fill: needleColor }}
          d={needlePath}
        ></animated.path>
      </g>
    </svg>
  );
};

export default GaugeSvg;
