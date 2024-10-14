import React from 'react';
import { FiSpeaker } from 'react-icons/fi';

import VolumeSlider from './VolumeSlider';
import { Tooltip } from '../../atoms/tooltip';
import { Button } from '../../atoms';

interface Props {
  onSpeakerClick: () => void;
}

const VolumeAndDeviceControl = ({ onSpeakerClick }: Props) => {
  return (
    <div className='flex items-center justify-center'>
      <Tooltip>
        {/* <TooltipTrigger>

        </TooltipTrigger> */}
        <Button
          variant={'ghost'}
          onClick={onSpeakerClick}
          className='p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          <FiSpeaker className='w-5 h-5' />
        </Button>

        {/* <TooltipContent>Change playback device</TooltipContent> */}
      </Tooltip>
      <VolumeSlider />
    </div>
  );
};

export default VolumeAndDeviceControl;
