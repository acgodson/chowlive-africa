import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import {
  ArrowLeftIcon,
  ChatBubbleIcon,
  CheckIcon,
  Component1Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  CopyIcon,
  DoubleArrowRightIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import SongControl from '@/components/molecules/SongControl';
import { ConnectedRoomUser } from '@/hooks/rooms/useConnectedRoomUsers';

import { useAuthContext } from '@/providers/web3-provider';
import useStore, { Modal } from '@/state/store';
import StyledAvatar from '@/components/molecules/StyledAvatar';

import Room from '@/utils/models/Room';
import Song from '@/utils/models/Song';
import { sidepanelAtom } from '../../../state/sidepanelAtom';

import SongProgress from '../SongProgress';
import { cn } from '@/utils';

type Props = {
  room: Room;
  song?: Song;
  show: boolean;
  users: ConnectedRoomUser[];
  shouldAlwaysShowUI: boolean;
  setShouldAlwaysShowUI: Dispatch<SetStateAction<boolean>>;
};

const FixedButtons = ({
  room,
  song,
  show,
  users,
  shouldAlwaysShowUI,
  setShouldAlwaysShowUI,
}: Props) => {
  const { handleSetModal } = useStore((store) => ({
    handleSetModal: store.handleSetModal,
  }));
  const { theme, setTheme } = useTheme();
  const [sidepanelStatus, setSidepanelStatus] = useAtom(sidepanelAtom);
  const { isAuthenticated } = useAuthContext();
  const [hasCopied, setHasCopied] = useState(false);

  const host = 'https://chowlive-africa.vercel.app';

  const onCopy = useCallback(() => {
    navigator.clipboard
      .writeText(`${host}/rooms/${room.slug}`)
      .then(() => {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }, [room.slug]);

  const handleQueue = handleSetModal(Modal.QueueSong);
  const handleDevices = handleSetModal(Modal.DeviceSelect);

  const handleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  const toggleChatVisibility = () => {
    setSidepanelStatus({
      ...sidepanelStatus,
      isRightOpen: !sidepanelStatus.isRightOpen,
    });
  };

  const displayedUsers = users.slice(0, 5);
  const hiddenUsers = users.slice(5);

  const FloatingContainer = ({ children, position, transparent = false }: any) => (
    <div
      className={cn(
        'absolute z-10 flex min-h-12 items-center justify-between rounded-full shadow-lg transition-opacity duration-500',
        transparent ? 'bg-transparent shadow-none' : 'bg-neutral-100 dark:bg-neutral-800',
        show ? 'opacity-100' : 'opacity-0',
        position === 'tl' && 'top-4 left-4',
        position === 't' && 'top-4 left-1/2 -ml-48 w-96 rounded-lg',
        position === 'tr2' && 'top-4 right-[4.5rem] bg-transparent shadow-none',
        position === 'tr' && 'top-4 right-4',
        position === 'bl' && 'bottom-4 left-4',
        position === 'b' && 'bottom-4 left-1/2 -ml-48 w-96 rounded-lg',
        position === 'br' && 'bottom-4 right-4'
      )}
    >
      {children}
    </div>
  );

  const CircularButton = ({ onClick, ariaLabel, children }: any) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className='p-4 rounded-full cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
    >
      {children}
    </button>
  );

  return (
    <>
      {/* <FloatingContainer position='tl'>
        <Link
          href='/'
          className='p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
        >
          <ArrowLeftIcon className='w-5 h-5' />
        </Link>
      </FloatingContainer> */}
      {/* 
      <FloatingContainer position='t'>
        <CircularButton onClick={onCopy} ariaLabel={hasCopied ? 'Copied!' : 'Copy room code'}>
          {hasCopied ? <CheckIcon className='w-5 h-5' /> : <CopyIcon className='w-5 h-5' />}
        </CircularButton>
        <h1 className='text-base font-bold'>{room.name}</h1>
        <CircularButton onClick={handleColorMode} ariaLabel='Toggle theme'>
          {theme === 'light' ? <MoonIcon className='w-5 h-5' /> : <SunIcon className='w-5 h-5' />}
        </CircularButton>
      </FloatingContainer> */}
      {/* 
      <FloatingContainer position='tr2'>
        <div className='flex flex-row-reverse items-center justify-center w-full'>
          {hiddenUsers.length > 0 && (
            <div className='p-0.5 rounded-full shadow -ml-4 bg-neutral-100 dark:bg-neutral-800'>
              <StyledAvatar src='' name={`${hiddenUsers.length.toString()}`} />
            </div>
          )}
          {displayedUsers.map((user) => (
            <div
              key={user.user_id}
              className='p-0.5 rounded-full shadow -ml-4 bg-neutral-100 dark:bg-neutral-800'
            >
              <StyledAvatar src={user.profile_photo} name={user.name} />
            </div>
          ))}
        </div>
      </FloatingContainer> */}

      {isAuthenticated && (
        <>
          {/* <FloatingContainer position='tr'>
            <CircularButton onClick={handleQueue} ariaLabel='Queue song'>
              <PlusIcon className='w-5 h-5' />
            </CircularButton>
          </FloatingContainer> */}

          {/* <FloatingContainer position='bl'>
            <button
              onClick={handleDevices}
              aria-label='Choose Spotify playback device'
              className='p-2 mx-[-2px] rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
            >
              <Component1Icon className='w-5 h-5' />
            </button>
            <button
              onClick={() => setShouldAlwaysShowUI((prev) => !prev)}
              aria-label={shouldAlwaysShowUI ? 'Hide UI when inactive' : 'Always show UI'}
              className='p-2 mx-[-2px] rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
            >
              {shouldAlwaysShowUI ? (
                <EyeOpenIcon className='w-5 h-5' />
              ) : (
                <EyeClosedIcon className='w-5 h-5' />
              )}
            </button>
            <SongControl song={song} />
          </FloatingContainer> */}

          {/* <FloatingContainer position='b'>
            <SongProgress song={song} />
          </FloatingContainer> */}

          <FloatingContainer position='br'>
            <CircularButton
              onClick={toggleChatVisibility}
              ariaLabel={sidepanelStatus.isRightOpen ? 'Close chat' : 'Open chat'}
            >
              {sidepanelStatus.isRightOpen ? (
                <DoubleArrowRightIcon className='w-5 h-5' />
              ) : (
                <ChatBubbleIcon className='w-5 h-5' />
              )}
            </CircularButton>
          </FloatingContainer>
        </>
      )}
    </>
  );
};

export default FixedButtons;
