import React, { memo, FC } from "react";
import useWebSocket from "react-use-websocket";
import SpanMoji from "../SpanMoji";
import CountUp from "react-countup";

const weiToEth = (wei: number): number => wei / 10 ** 18;

const TotalFeeBurn: FC = () => {
  const { lastJsonMessage } = useWebSocket(
    "wss://api.ultrasound.money/fees-ropsten/base-fee-feed",
    {
      share: true,
      filter: (message) => JSON.parse(message.data).type === "base-fee-update",
      retryOnError: true,
      shouldReconnect: () => true,
    }
  );
  const totalFeesBurned: number | undefined = lastJsonMessage?.totalFeesBurned;

  return (
    <div className="bg-blue-tangaroa w-full rounded-lg p-8">
      <div className="flex justify-between">
        <p className="font-inter font-light text-blue-shipcove md:text-xl mb-2">
          cumulative fee burn
        </p>
      </div>
      {typeof totalFeesBurned === "number" ? (
        <p className="font-roboto flex justify-between text-white text-3xl md:text-4xl lg:text-3xl xl:text-5xl">
          <CountUp
            decimals={2}
            duration={2.5}
            separator=","
            end={weiToEth(totalFeesBurned)}
            suffix=" ETH"
            preserveValue={true}
          />
          <SpanMoji emoji="🔥" />
        </p>
      ) : (
        <p className="font-roboto text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
          loading...
        </p>
      )}
    </div>
  );
};

export default memo(TotalFeeBurn);
