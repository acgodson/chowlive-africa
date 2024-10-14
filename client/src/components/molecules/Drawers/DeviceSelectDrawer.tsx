import { useCallback, useEffect, useState } from 'react';
import { FiAlertCircle, FiRefreshCcw } from 'react-icons/fi';

import useStore, { Modal } from '@/state/store';
import { useAuthContext } from '@/providers/web3-provider';
import { getDatabase, get, ref } from 'firebase/database';

import { Alert, AlertDescription, AlertTitle, Button, Spinner } from '../../atoms';

import Drawer from '../../atoms/drawer';
import RadioCardGroup from '../radioCardGroups';




const DeviceSelectDrawer = () => {
  const { user } = useAuthContext();
  const { spotify, modal, setModal, handleSetModal } = useStore((store) => ({
    spotify: store.spotify,
    modal: store.modal,
    setModal: store.setModal,
    handleSetModal: store.handleSetModal,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [isTransferingPlayback, setIsTransferingPlayback] = useState(false);
  const [devices, setDevices] = useState<SpotifyApi.UserDevice[]>([]);

  const isOpen = modal === Modal.DeviceSelect;

  const getDevices = useCallback(async () => {
    if (user && spotify) {
      const rtdb = getDatabase();
      const tokenSnapshot = await get(ref(rtdb, `spotifyAccessToken/${user.uid}`));
      const accessToken = tokenSnapshot.val();

      setIsLoading(true);
      spotify.setAccessToken(accessToken);
      const devicesResponse = await spotify.getMyDevices();
      setDevices(devicesResponse.devices);
      setIsLoading(false);
    }
  }, [user, spotify]);

  useEffect(() => {
    if (isOpen) getDevices();
  }, [user, getDevices, isOpen, spotify]);

  const updateSelectedDevice = async (device_id: string) => {
    if (spotify) {
      setIsTransferingPlayback(true);
      await spotify.transferMyPlayback([device_id]).catch((err) => console.error(err));
      console.log('Successfully changed playback to ' + device_id);
      setIsTransferingPlayback(false);
    }
  };

  const toggleModal = () => {
    setModal(Modal.None);
    handleSetModal(Modal.None);
  };

  return (
    <Drawer isOpen={isOpen} onClose={toggleModal}>
      <div className='p-4 sm:p-6 md:p-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold'>Select Playback Device</h2>
            <Button onClick={getDevices}>
              <FiRefreshCcw className='h-4 w-4' />
            </Button>
          </div>
          <div className='space-y-4'>
            {isLoading ? (
              <div className='flex items-center justify-center p-16'>
                <Spinner className='h-8 w-8' />
              </div>
            ) : devices.length === 0 ? (
              <Alert>
                <FiAlertCircle className='h-4 w-4' />
                <AlertTitle>Can't listen together if you have nothing to listen on!</AlertTitle>
                <AlertDescription>
                  Looks like you don't have any available devices. Try opening up Spotify on one of
                  your devices, or swap to a browser that supports{' '}
                  <a
                    href='https://developer.spotify.com/documentation/web-playback-sdk/#supported-browsers'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-semibold underline'
                  >
                    Spotify's Web Playback SDK.
                  </a>
                </AlertDescription>
              </Alert>
            ) : (
              <div>
                <RadioCardGroup
                  name='deviceSelect'
                  options={devices
                    .filter((device) => !!device.id)
                    .map((device) => ({
                      label: device.name,
                      value: device.id as string,
                      type: device.type,
                      isChecked: device.is_active,
                    }))}
                  onChange={(id) => updateSelectedDevice(id)}
                  isLoading={isTransferingPlayback}
                />
                <p className='text-center mt-4 text-sm text-gray-600 dark:text-gray-400'>
                  Looking for a device that isn't here? Try opening up Spotify on one of your
                  devices, or swap to a browser that supports{' '}
                  <a
                    href='https://developer.spotify.com/documentation/web-playback-sdk/#supported-browsers'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-semibold underline'
                  >
                    Spotify's Web Playback SDK.
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default DeviceSelectDrawer;
