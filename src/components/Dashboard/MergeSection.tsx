import {
  addHours,
  differenceInMilliseconds,
  getTime,
  isBefore,
  parseISO,
  startOfHour,
  subMilliseconds,
} from "date-fns";
import _last from "lodash/last";
import dynamic from "next/dynamic";
import type { FC } from "react";
import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import type { MergeEstimate } from "../../api/merge-estimate";
import { useTotalDifficultyProgress } from "../../api/total-difficulty-progress";
import { pointsFromTotalDifficultyProgress } from "../../api/total-difficulty-progress";
import { TOTAL_TERMINAL_DIFFICULTY } from "../../eth-constants";
import MergeEstimateWidget from "../MergeEstimateWidget";
import TotalDifficultyProgressWidget from "../TotalDifficultyProgressWidget";
import BasicErrorBoundary from "../BasicErrorBoundary";
const TotalDifficultyProjectionWidget = dynamic(
  () => import("../TotalDifficultyProjectionWidget"),
);

type JsTimestamp = number;
type Percent = number;
export type TTDPercentPoint = [JsTimestamp, Percent];

type Props = {
  mergeEstimate: MergeEstimate;
};

const MergeSection: FC<Props> = ({ mergeEstimate }) => {
  const totalDifficultyProgress = useTotalDifficultyProgress();
  const [difficultyProjectionSeries, setDifficultyProjectionSeries] =
    useState<TTDPercentPoint[]>();
  const progress = Math.min(
    1,
    Number(mergeEstimate.totalDifficulty) / TOTAL_TERMINAL_DIFFICULTY,
  );

  const totalDifficultyByDay = useMemo(
    () =>
      totalDifficultyProgress === undefined
        ? undefined
        : pointsFromTotalDifficultyProgress(totalDifficultyProgress),
    [totalDifficultyProgress],
  );

  useEffect(() => {
    if (totalDifficultyProgress === undefined) {
      return undefined;
    }

    const lastTotalDifficultyPoint = _last(totalDifficultyByDay);

    if (lastTotalDifficultyPoint === undefined) {
      throw new Error("expect at least one point in totalDifficultyByDay");
    }

    // This will update every block, consider reducing that frequency.
    const generatedProjection: TTDPercentPoint[] = [];
    const mergeTimestamp = parseISO(mergeEstimate.estimatedDateTime);

    const periodMillis = differenceInMilliseconds(
      mergeTimestamp,
      lastTotalDifficultyPoint[0],
    );
    const percentLeft = 100 - lastTotalDifficultyPoint[1];
    let timestamp = startOfMinute(addMinutes(lastTotalDifficultyPoint[0], 1));
    while (isBefore(timestamp, mergeTimestamp)) {
      const millisSinceLast = subMilliseconds(
        timestamp,
        getTime(lastTotalDifficultyPoint[0]),
      );
      const fraction = getTime(millisSinceLast) / periodMillis;
      const percent = lastTotalDifficultyPoint[1] + fraction * percentLeft;
      const point = [getTime(timestamp), percent] as TTDPercentPoint;
      generatedProjection.push(point);
      timestamp = addMinutes(timestamp, 1);
    }

    setDifficultyProjectionSeries(generatedProjection);
  }, [
    mergeEstimate.estimatedDateTime,
    totalDifficultyByDay,
    totalDifficultyProgress,
  ]);

  const difficultyMap = Object.fromEntries(
    new Map(totalDifficultyByDay).entries(),
  );

  const difficultyProjectionMap = Object.fromEntries(
    new Map(difficultyProjectionSeries ?? []).entries(),
  );

  return (
    <BasicErrorBoundary>
      <Suspense>
        <div
          className="mt-16 mb-32 flex flex-col gap-y-4 xs:px-4 md:px-16"
          id="merge"
        >
          <div className="flex flex-col lg:flex-row gap-x-4 gap-y-4 mt-16">
            <div className="flex flex-col gap-y-4 md:w-full md:min-w-fit">
              <TotalDifficultyProgressWidget
                mergeEstimate={mergeEstimate}
                progress={progress}
              />
              <MergeEstimateWidget mergeEstimate={mergeEstimate} />
            </div>
            <TotalDifficultyProjectionWidget
              difficultyMap={difficultyMap}
              difficultyProjectionMap={difficultyProjectionMap}
              difficultyProjectionSeries={difficultyProjectionSeries}
              difficultySeries={totalDifficultyByDay}
              timestamp={totalDifficultyProgress?.timestamp}
            />
          </div>
        </div>
      </Suspense>
    </BasicErrorBoundary>
  );
};

export default MergeSection;
