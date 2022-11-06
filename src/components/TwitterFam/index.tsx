import { FC, forwardRef, RefObject, useEffect } from "react";
import { useCallback, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { usePopper } from "react-popper";
import type { FamProfile } from "../../api/profiles";
import { useProfiles } from "../../api/profiles";
import { useActiveBreakpoint } from "../../utils/use-active-breakpoint";
import ImageWithTooltip from "../ImageWithTooltip";
import Modal from "../Modal";
import FamTooltip from "../FamTooltip";
import scrollbarStyles from "../../styles/Scrollbar.module.scss";
import Twemoji from "../Twemoji";
import { FixedSizeGrid as Grid } from "react-window";
import { setRequestMeta } from "next/dist/server/request-meta";

// See if merging with leaderboards tooltip makes sense after making it more generic.
export const useTooltip = () => {
  const { md } = useActiveBreakpoint();
  const [refEl, setRefEl] = useState<HTMLImageElement | null>(null);
  const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(refEl, popperEl, {
    placement: "right",
    modifiers: [
      {
        name: "flip",
      },
    ],
  });
  const [selectedItem, setSelectedItem] = useState<FamProfile>();
  const [showTooltip, setShowTooltip] = useState(false);
  const onTooltip = useRef<boolean>(false);
  const onImage = useRef<boolean>(false);

  const handleImageMouseEnter = useCallback(
    (profile: FamProfile, ref: RefObject<HTMLImageElement>) => {
      // The ranking data isn't there yet so no tooltip can be shown.
      if (profile === undefined) {
        return;
      }

      onImage.current = true;

      // Delayed show.
      const id = window.setTimeout(() => {
        if (onImage.current || onTooltip.current) {
          setRefEl(ref.current);
          setSelectedItem(profile);
          setShowTooltip(true);
        }
      }, 300);

      return () => window.clearTimeout(id);
    },
    [onImage, onTooltip],
  );

  const handleImageMouseLeave = useCallback(() => {
    onImage.current = false;

    // Delayed hide.
    const id = window.setTimeout(() => {
      if (!onImage.current && !onTooltip.current) {
        setShowTooltip(false);
        setSelectedItem(undefined);
      }
    }, 300);

    return () => window.clearTimeout(id);
  }, [onImage, onTooltip]);

  const handleTooltipEnter = useCallback(() => {
    onTooltip.current = true;
  }, []);

  const handleTooltipLeave = useCallback(() => {
    onTooltip.current = false;

    // Delayed hide.
    const id = window.setTimeout(() => {
      if (!onImage.current && !onTooltip.current) {
        setShowTooltip(false);
        setSelectedItem(undefined);
      }
    }, 100);

    return () => window.clearTimeout(id);
  }, [onImage, onTooltip]);

  const handleClickImage = useCallback(
    (ranking: FamProfile | undefined) => {
      if (md) {
        return;
      }

      setSelectedItem(ranking);
    },
    [md, setSelectedItem],
  );

  return {
    attributes,
    handleClickImage,
    handleImageMouseEnter,
    handleImageMouseLeave,
    handleTooltipEnter,
    handleTooltipLeave,
    selectedItem,
    setPopperEl,
    setSelectedItem,
    showTooltip,
    popperStyles: styles,
  };
};

const TwitterFam: FC = () => {
  const profiles = useProfiles()?.profiles;
  const { md } = useActiveBreakpoint();
  const COLUMN_LENGTH = 1000;

  // Copy batsound feedback
  const [isCopiedFeedbackVisible, setIsCopiedFeedbackVisible] = useState(false);
  const onBatSoundCopied = () => {
    setIsCopiedFeedbackVisible(true);
    setTimeout(() => setIsCopiedFeedbackVisible(false), 400);
  };

  // Support profile skeletons.
  const currentProfiles =
  profiles === undefined
  ? (new Array(120).fill(undefined) as undefined[])
  : profiles;
  
  // Create 6000 profiles (mock data)
  const allProfiles: any[] = [];
  for (let i = 0; i < 83; i++) {
    allProfiles.push(...currentProfiles);
  }

  const RenderImageWithTooltip = ({ style, columnIndex, rowIndex }: any) => {
    // Don't have access to a single index, need to manually create one from colum and row
    let index = columnIndex + rowIndex;
    const columnLength = COLUMN_LENGTH - 1;
    for (let currentRow = 0; currentRow < rowIndex; currentRow++) {
      index += columnLength;
    }
    return (
      <div style={style}>
        <ImageWithTooltip
          key={index}
          // key={allProfiles[index]?.profileUrl ?? index} // Would be using this with real data
          className="h-10 max-h-10 w-10 select-none p-1" 
          imageUrl={allProfiles[index]?.profileImageUrl}
          isDoneLoading={allProfiles[index] !== undefined}
          skeletonDiameter="40px"
          onMouseEnter={(ref) =>
            !md || allProfiles[index] === undefined
              ? () => undefined
              : handleImageMouseEnter(allProfiles[index], ref)
          }
          onMouseLeave={() => (!md ? () => undefined : handleImageMouseLeave())}
          onClick={() => handleClickImage(allProfiles[index])}
          height={40}
          width={40}
        />
      </div>
    );
  };

  const {
    attributes,
    handleClickImage,
    handleImageMouseEnter,
    handleImageMouseLeave,
    handleTooltipEnter,
    handleTooltipLeave,
    popperStyles,
    selectedItem,
    setPopperEl,
    setSelectedItem,
    showTooltip,
  } = useTooltip();

  return (
    <>
      <h1 className="mb-8 text-center text-2xl font-light text-white md:text-3xl xl:text-41xl">
        <a
          target="_blank"
          href="https://twitter.com/i/lists/1376636817089396750/members"
          rel="noopener noreferrer"
          role="link"
          title="join the ultra sound Twitter fam"
          className="relative h-full hover:text-blue-spindle hover:underline"
        >
          join 5000+ fam members
        </a>
      </h1>
      <div className="flex items-center justify-center">
        <p className="text-blue-shipcove md:text-lg">wear the bat signal</p>
        <div className="w-4"></div>
        <CopyToClipboard text={"🦇🔊"} onCopy={onBatSoundCopied}>
          <span className="clipboard-emoji relative isolate mx-auto flex w-48 cursor-pointer items-center justify-between rounded-full border border-gray-700 bg-blue-midnightexpress p-2 pl-5 text-2xl">
            <Twemoji className="flex gap-x-1" imageClassName="w-7" wrapper>
              🦇🔊
            </Twemoji>
            <span className="copy-container isolate select-none rounded-full bg-mediumspring px-5 py-1 text-base font-light text-blue-midnightexpress">
              copy
            </span>
            <span
              className={`absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center rounded-full bg-blue-midnightexpress p-1 transition-opacity ${
                isCopiedFeedbackVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="font-inter text-base font-light text-white">
                copied!
              </p>
            </span>
          </span>
        </CopyToClipboard>
      </div>
      <div className="h-16"></div>

      {/* All Profiles */}
      <div className="w-[96vw]">
        <Grid
          className={`mx-auto ${scrollbarStyles["styled-scrollbar-horizontal"]} ${scrollbarStyles["styled-scrollbar"]}`}
          columnCount={COLUMN_LENGTH}
          columnWidth={40}
          rowCount={10}
          rowHeight={40}
          height={440}
          width={1200}
        >
          {RenderImageWithTooltip}
        </Grid>
      </div>
      <>
        <div
          ref={setPopperEl}
          className="z-10 hidden p-4 md:block"
          style={{
            ...popperStyles.popper,
            visibility: showTooltip && md ? "visible" : "hidden",
          }}
          {...attributes.popper}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
        >
          <FamTooltip
            description={selectedItem?.bio}
            famFollowerCount={selectedItem?.famFollowerCount}
            followerCount={selectedItem?.followersCount}
            imageUrl={selectedItem?.profileImageUrl}
            links={selectedItem?.links}
            title={selectedItem?.name}
            twitterUrl={selectedItem?.profileUrl}
            width="min-w-[20rem] max-w-sm"
          />
        </div>
        <Modal
          onClickBackground={() => setSelectedItem(undefined)}
          show={!md && selectedItem !== undefined}
        >
          {!md && selectedItem !== undefined && (
            <FamTooltip
              description={selectedItem.bio}
              famFollowerCount={selectedItem.famFollowerCount}
              followerCount={selectedItem.followersCount}
              imageUrl={selectedItem.profileImageUrl}
              links={selectedItem.links}
              onClickClose={() => setSelectedItem(undefined)}
              title={selectedItem.name}
              twitterUrl={selectedItem.profileUrl}
              width="min-w-[18rem] max-w-md"
            />
          )}
        </Modal>
      </>
    </>
  );
};

export default TwitterFam;
