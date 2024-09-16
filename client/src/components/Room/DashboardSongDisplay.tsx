import { cn } from '@/util/index';
import React from 'react';

interface Props {
  title: string;
  artist: string;
  album: string;
  playback?: {
    progress: number;
    length: number;
  };
  src?: string;
  standalone?: boolean;
  imageRef?: React.MutableRefObject<HTMLImageElement | null>;
}

const DashboardSongDisplay = ({
  title,
  artist,
  album,
  playback,
  src,
  standalone,
  imageRef,
}: Props) => {
  if (standalone && src)
    return (
      <div>
        <div className="flex flex-row md:flex-col items-center justify-between">
          <img
            src={src}
            className="h-12 w-12 sm:h-16 sm:w-16 md:h-32 md:w-32"
            ref={imageRef}
            alt="Album cover"
          />
          <div className="flex-1 md:flex-initial mt-0 md:mt-4 ml-4 md:ml-0 text-left md:text-center">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-sm">{artist}</p>
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <div className="flex">
        {src ? (
          <img
            src={src}
            className={cn(
              "h-12 w-12",
              playback && "h-16 w-16"
            )}
            alt="Album cover"
          />
        ) : (
          <div 
            className={cn(
              "bg-gray-300",
              "h-12 w-12",
              playback && "h-16 w-16"
            )}
          ></div>
        )}
        <div className="ml-3 flex flex-col justify-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm">
            {artist} • {album}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSongDisplay;