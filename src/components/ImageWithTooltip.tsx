import type { StaticImageData } from "next/image";
import Image from "next/image";
import type { FC, RefObject } from "react";
import { useCallback, useContext, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import questionMarkSvg from "../assets/question-mark-v2.svg";
import { FeatureFlagsContext } from "../feature-flags";

type ImageWithTooltipProps = {
  className?: HTMLImageElement["className"];
  height: number;
  imageUrl: string | undefined;
  isDoneLoading?: boolean;
  onClick?: () => void;
  onMouseEnter?: (ref: RefObject<HTMLImageElement>) => void;
  onMouseLeave?: (ref: RefObject<HTMLImageElement>) => void;
  skeletonDiameter?: string;
  width: number;
};

const ImageWithTooltip: FC<ImageWithTooltipProps> = ({
  className = "",
  height,
  imageUrl,
  isDoneLoading = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  width,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const { previewSkeletons } = useContext(FeatureFlagsContext);
  const [imgSrc, setImgSrc] = useState<string | StaticImageData | undefined>(
    imageUrl,
  );

  const onImageError = useCallback(() => {
    setImgSrc(questionMarkSvg as StaticImageData);
  }, []);

  return (
    <div>
      {!isDoneLoading || previewSkeletons ? (
        <div className={className}>
          <Skeleton
            circle={true}
            height={`${height - 8}px`}
            width={`${width - 8}px`}
            inline
          />
        </div>
      ) : (
        <div
          ref={imageRef}
          onMouseEnter={() =>
            onMouseEnter === undefined ? undefined : onMouseEnter(imageRef)
          }
          onMouseLeave={() =>
            onMouseLeave === undefined ? undefined : onMouseLeave(imageRef)
          }
          className={className}
        >
          <Image
            className={`
                cursor-pointer
                rounded-full active:brightness-125
                md:cursor-auto md:active:brightness-100
                ${onMouseEnter !== undefined ? "hover:opacity-60" : ""}
              `}
            src={imgSrc ?? (questionMarkSvg as StaticImageData)}
            alt="logo of an ERC20 token"
            onError={onImageError}
            onClick={onClick}
            width={width}
            height={height}
          />
        </div>
      )}
    </div>
  );
};

export default ImageWithTooltip;
