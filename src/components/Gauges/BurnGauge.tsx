import type { FC } from "react";
import type { GroupedAnalysis1 } from "../../api/grouped-analysis-1";
import colors from "../../colors";
import type { Unit } from "../../denomination";
import * as Format from "../../format";
import type { TimeFrameNext } from "../../time-frames";
import { timeframeBurnRateMap } from "../BurnTotal";
import IssuanceBurnBaseGauge from "./IssuanceBurnBaseGauge";

type BurnGaugeProps = {
  groupedAnalysis1: GroupedAnalysis1;
  timeFrame: TimeFrameNext;
  unit: Unit;
};

const BurnGauge: FC<BurnGaugeProps> = ({
  groupedAnalysis1,
  timeFrame,
  unit,
}) => {
  const preBurnRate =
    groupedAnalysis1.burnRates[timeframeBurnRateMap[timeFrame][unit]];
  const burnRate =
    preBurnRate === undefined
      ? undefined
      : unit === "eth"
      ? Format.ethFromWei(preBurnRate * 60 * 24 * 365.25) / 10 ** 6
      : (preBurnRate * 60 * 24 * 365.25) / 10 ** 9;

  return (
    <div
      className={`
        flex flex-col justify-start items-center
        bg-blue-tangaroa
        px-4 md:px-0 py-8 pt-7
        rounded-lg md:rounded-none md:rounded-tl-lg
      `}
    >
      <IssuanceBurnBaseGauge
        emoji="flame"
        gaugeUnit={unit === "eth" ? "M" : "B"}
        gradientFill="orange"
        groupedAnalysis1={groupedAnalysis1}
        needleColor={colors.fireOrange}
        title="burn"
        unit={unit}
        value={burnRate}
        valueUnit={unit === "eth" ? "ETH/year" : "USD/year"}
      />
    </div>
  );
};

export default BurnGauge;
