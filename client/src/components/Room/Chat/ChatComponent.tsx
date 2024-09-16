import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useAtom } from 'jotai';
import { useTheme } from 'next-themes';

import ChatDisplay from './ChatDisplay';
import ChatInput from './ChatInput';
import useMessages from '../../../hooks/firebase/useMessages';
import { roomAtom } from '../../../state/roomAtom';
import { sidepanelAtom } from '../../../state/sidepanelAtom';
import { cn } from '@/util/index';

export type ChatComponentType = 'panel' | 'full';

const ChatComponent = () => {
  const [room] = useAtom(roomAtom);
  const [sidepanelStatus] = useAtom(sidepanelAtom);
  const { theme } = useTheme();

  const messages = useMessages(room.id);

  return (
    <div
      className={cn(
        'w-[28rem] h-screen transition-all duration-300 highest-z-index',
        sidepanelStatus.isRightOpen ? 'translate-x-0 ml-0' : 'translate-x-[28rem] -ml-[28rem]',
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      )}
    >
      <ScrollArea.Root className='overflow-hidden flex-1 h-[calc(100%-4rem)]'>
        <ScrollArea.Viewport className='w-full h-full rounded-inherit p-4 relative'>
          <ChatDisplay messages={messages.array} />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className={cn(
            'flex select-none touch-none p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-3.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-3.5',
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          )}
          orientation='vertical'
        >
          <ScrollArea.Thumb
            className={cn(
              "flex-1 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]",
              theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'
            )}
          />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} />
      </ScrollArea.Root>
      <ChatInput />
    </div>
  );
};

export default ChatComponent;
