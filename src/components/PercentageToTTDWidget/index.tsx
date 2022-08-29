import * as DateFns from "date-fns";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsAnnotations from "highcharts/modules/annotations";
import _last from "lodash/last";
import _merge from "lodash/merge";
import type { FC } from "react";
import { useMemo } from "react";
import colors from "../../colors";
import * as Format from "../../format";
import LabelText from "../TextsNext/LabelText";
import WidgetErrorBoundary from "../WidgetErrorBoundary";
import { WidgetBackground } from "../WidgetSubcomponents";
import styles from "./styles.module.css";

// Somehow resolves an error thrown by the annotation lib
if (typeof window !== "undefined") {
  // Initialize highchats annotations module (only on browser, doesn't work on server)
  highchartsAnnotations(Highcharts);
}

type UnixTimestamp = number;
type Point = [UnixTimestamp, number];

const baseOptions: Highcharts.Options = {
  accessibility: { enabled: false },
  chart: {
    backgroundColor: "transparent",
    showAxes: false,
    marginLeft: 42,
  },
  title: undefined,
  xAxis: {
    type: "datetime",
    min: 1659304800000,
    max: 1663279200000,
    lineWidth: 0,
    labels: { style: { color: colors.slateus400 } },
    tickWidth: 0,
  },
  yAxis: {
    max: 100,
    title: { text: undefined },
    labels: {
      format: "{value}%",
      style: { color: colors.slateus400, fontFamily: "Roboto Mono" },
    },
    gridLineWidth: 0,
  },
  legend: {
    enabled: false,
  },
  tooltip: {
    backgroundColor: "transparent",
    xDateFormat: "%m-%d",
    useHTML: true,
    borderWidth: 4,
    shadow: false,
  },
  credits: { enabled: false },
  plotOptions: {
    series: {
      marker: {
        enabled: false,
        lineColor: "white",
        fillColor: "#4B90DB",
        radius: 5,
        symbol: "circle",
      },
    },
  },
};

type Props = {
  difficultySeries: Point[];
  // A map used for fast-lookup of the Y in the series above by X.
  difficultyMap: Record<number, number>;
  difficultyProjectionSeries: Point[];
  // A map used for fast-lookup of the Y in the series above by X.
  difficultyProjectionMap: Record<number, number>;
};

const PercentageToTTDWidget: FC<Props> = ({
  difficultyMap,
  difficultyProjectionMap,
  difficultyProjectionSeries,
  difficultySeries,
}) => {
  const options = useMemo((): Highcharts.Options => {
    const lastPoint = _last(difficultySeries);
    const lastPointProjection = _last(difficultyProjectionSeries);
    return _merge(
      {},
      {
        ...baseOptions,
        ...({
          series: [
            {
              id: "difficulty-projection-series",
              type: "line",
              dashStyle: "Dash",
              color: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 1,
                  y2: 0,
                },
                stops: [
                  [0, "#5487F4"],
                  [1, "#6A54F4"],
                ],
              },
              data:
                lastPointProjection === undefined
                  ? undefined
                  : [
                      ...difficultyProjectionSeries,
                      {
                        x: lastPointProjection?.[0],
                        y: lastPointProjection?.[1],
                        marker: {
                          symbol: `url(/graph-dot-panda.svg)`,
                          enabled: true,
                        },
                      },
                    ],
            },
            {
              enableMouseTracking: false,
              id: "difficulty-projection-series-shadow",
              states: { hover: { enabled: false }, select: { enabled: false } },
              type: "line",
              color: {},
              shadow: {
                color: "rgba(75, 144, 219, 0.2)",
                width: 15,
              },
              data: difficultyProjectionSeries,
            },
            {
              id: "difficulty-series",
              type: "line",
              data:
                lastPoint !== undefined
                  ? [
                      ...difficultySeries,
                      {
                        x: lastPoint?.[0],
                        y: lastPoint?.[1],
                        marker: {
                          symbol: `url(/dot_supply_graph.svg)`,
                          enabled: true,
                        },
                      },
                    ]
                  : undefined,
              shadow: {
                color: "rgba(75, 144, 219, 0.2)",
                width: 15,
              },
              color: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 1,
                  y2: 0,
                },
                stops: [
                  [0, "#00FFFB"],
                  [1, "#5487F4"],
                ],
              },
            },
          ],
          tooltip: {
            backgroundColor: "transparent",
            useHTML: true,
            borderWidth: 0,
            shadow: false,
            formatter: function () {
              const x = typeof this.x === "number" ? this.x : undefined;
              if (x === undefined) {
                return undefined;
              }

              const total = difficultyMap[x] || difficultyProjectionMap[x];
              if (total === undefined) {
                return undefined;
              }

              const dt = new Date(x);
              const formattedDate = DateFns.format(dt, "MMM d");

              return `<div class="font-roboto bg-slateus-700 p-4 rounded-lg border-2 border-slateus-200"><div class="text-blue-spindle">${formattedDate}</div><div class="text-white">${Format.formatPercentTwoDecimals(
                total / 100,
              )}</div></div>`;
            },
          },
        } as Highcharts.Options),
      },
    );
  }, [
    difficultyMap,
    difficultyProjectionMap,
    difficultyProjectionSeries,
    difficultySeries,
  ]);

  return (
    <WidgetErrorBoundary title="percentage to TTD">
      <WidgetBackground className="relative w-full flex flex-col gap-y-8 overflow-hidden">
        <div
          // will-change-transform is critical for mobile performance of rendering the chart overlayed on this element.
          className={`
            absolute -top-40 -right-0
            w-full h-full
            opacity-[0.20]
            blur-[120px]
            pointer-events-none
            will-change-transform
          `}
        >
          <div
            className={`
            absolute lg:bottom-[3.0rem] lg:-right-[1.0rem]
            w-4/5 h-3/5 rounded-[35%]
            bg-[#0037FA]
            pointer-events-none
          `}
          ></div>
        </div>
        <LabelText className="flex items-center min-h-[21px]">
          percentage to ttd
        </LabelText>
        <div
          // flex-grow fixes bug where highcharts doesn't take full width.
          className={`
            w-full h-full
            flex justify-center
            select-none
            overflow-hidden
            [&>div]:flex-grow
            ${styles.chart}
          `}
        >
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <div className="flex justify-end">
          <LabelText className="text-slateus-400">
            inspired by{" "}
            <a
              className="hover:underline"
              href="https://bordel.wtf"
              rel="noreferrer"
              target="_blank"
            >
              bordel.wtf
            </a>
          </LabelText>
        </div>
      </WidgetBackground>
    </WidgetErrorBoundary>
  );
};
export default PercentageToTTDWidget;
