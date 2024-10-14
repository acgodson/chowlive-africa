import { FaChevronDown } from 'react-icons/fa';
import { useProfileContext } from '@/providers/user-provider';
import useStore, { Modal } from '@/state/store';

import ColorModeButton from '@/components/atoms/ColorModeButton';
import DashboardSongControls from '../Room/DashboardSongControls';
import VolumeAndDeviceControl from '../Room/VolumeAndDeviceControl';
import Drawer from '../../atoms/drawer';
import { cn } from '@/utils';



const PlaybackControlDrawer = () => {
  const { profile } = useProfileContext();
  const { modal, setModal, handleSetModal } = useStore((store) => ({
    modal: store.modal,
    setModal: store.setModal,
    handleSetModal: store.handleSetModal,
  }));

  const isOpen = modal === Modal.PlaybackControl;

  const toggleModal = () => {
    setModal(Modal.None);
    handleSetModal(Modal.None);
  };

  return (
    <Drawer isOpen={isOpen} onClose={toggleModal} direction='top'>
      <div className='p-2 sm:p-4 md:p-8'>
        <div className='flex flex-col items-center justify-center max-w-[600px] mx-auto'>
          <h2 className='text-xl font-semibold mb-2'>User + Appearance</h2>
          <div className='flex items-center'>
            <button
              className={cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
                'hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4'
              )}
            >
              <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2'>
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || 'Guest User'}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-sm font-medium'>
                    {(profile?.displayName || 'Guest User').charAt(0)}
                  </span>
                )}
              </div>
              <FaChevronDown className='ml-2' />
            </button>
            <ColorModeButton />
          </div>
          <h2 className='text-xl font-semibold mt-8 mb-2'>Song Playback</h2>
          <DashboardSongControls />
          <div className='h-8' />
          <h2 className='text-xl font-semibold mt-8 mb-2'>Volume + Device</h2>
          <VolumeAndDeviceControl onSpeakerClick={() => handleSetModal(Modal.PlaybackControl)} />
        </div>
      </div>
    </Drawer>
  );
};

export default PlaybackControlDrawer;
