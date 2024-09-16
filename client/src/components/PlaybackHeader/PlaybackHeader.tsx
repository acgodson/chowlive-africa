import React from 'react';
import { FiChevronDown, FiMusic } from 'react-icons/fi';

import { useProfileContext } from 'src/lib/UserProvider';
import useStore, { Modal } from 'src/state/store';

import Room from '../../models/Room';
import Song from '../../models/Song';
import ColorModeButton from '../ColorModeButton';
import CreateRoomButton from './CreateRoomButton';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../atoms/tooltip';
import DashboardSongControls from '../Room/DashboardSongControls';
import VolumeAndDeviceControl from '../Room/VolumeAndDeviceControl';
import PlaybackHeaderSongDisplay from './PlaybackHeaderSongDisplay';

import StyledAvatar from '../molecules/StyledAvatar';
import { Button } from '../atoms';
import { useTheme } from 'next-themes';

interface Props {
  placement?: 'top' | 'bottom';
  isHome?: boolean;
  song?: Song;
  room?: Room;
}

const PlaybackHeader = ({ placement = 'top', isHome, song, room }: Props) => {
  const { profile } = useProfileContext();
  const { handleSetModal } = useStore((store) => ({
    handleSetModal: store.handleSetModal,
  }));

  const { theme } = useTheme();

  return (
    <div>
      {isHome && <div className='h-24' />}
      <div
        className={`
         ${
           theme === 'light'
             ? 'bg-gradient-to-br from-[#FAFAFA] to-[#EAEFF2]'
             : 'bg-gradient-to-br from-[#1a1c20] to-[#2c313c]'
         }
          fixed ${
            placement === 'top' ? 'top-0' : 'bottom-0'
          } w-full h-[fit-content] z-10  grid grid-cols-1 sm:grid-cols-[1fr_auto] md:grid-cols-[2fr_4fr_1fr] lg:grid-cols-[1fr_3fr_1fr] py-0.5 px-2 sm:px-8`}
      >
        <div className='hidden md:flex items-center justify-center'>
          {!room || !room.name ? <CreateRoomButton /> : <DashboardSongControls song={song} />}
        </div>
        <div className='flex items-center justify-between p-2 rounded-md w-full'>
          <PlaybackHeaderSongDisplay song={song} room={room} />
          <div className='hidden lg:block'>
            <VolumeAndDeviceControl onSpeakerClick={() => handleSetModal(Modal.DeviceSelect)} />
          </div>
        </div>
        <div className='hidden lg:flex items-center justify-center'>
          <Button variant='ghost' className='flex items-center'>
            <StyledAvatar
              src={profile?.avatarUrl ?? ''}
              name={profile?.displayName ?? ''}
              className='w-8 h-8 mr-2'
            />

            <FiChevronDown />
          </Button>
          <ColorModeButton />
        </div>
        <div className='flex lg:hidden items-center justify-center'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' onClick={() => handleSetModal(Modal.PlaybackControl)}>
                  <FiMusic className='text-xl' />
                </Button>
              </TooltipTrigger>
              {/* <TooltipContent>
                <p>Options and Playback</p>
              </TooltipContent> */}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default PlaybackHeader;
