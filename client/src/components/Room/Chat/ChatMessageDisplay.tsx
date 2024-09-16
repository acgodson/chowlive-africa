import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import StyledAvatar from 'src/components/molecules/StyledAvatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { doc, getDoc } from 'firebase/firestore';
import { Message, MessageType } from '../../../models/Message';
import { getFirestoreDB } from '@/util/firebase';
import { cn } from '@/util/index';

interface Props {
  message: Message;
  index: number;
  previousUser: string;
}

interface FirestoreProfile {
  displayName: string;
  avatarUrl: string;
}

dayjs.extend(relativeTime);

const ChatMessageDisplay = ({ message, index, previousUser }: Props) => {
  const isUserChat = message.type === MessageType.UserChat;
  const isSameUser: boolean = message.userId === previousUser;
  const { theme } = useTheme();

  const [user, setUser] = useState<FirestoreProfile | null>(null);
  const db = getFirestoreDB();

  useEffect(() => {
    const fetchUser = async () => {
      if (!message.userId || isSameUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', message.userId));
        if (userDoc.exists()) {
          setUser(userDoc.data() as FirestoreProfile);
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [message.userId, isSameUser, db]);

  const displayName = user?.displayName || '';
  const avatarUrl = user?.avatarUrl || '';

  return (
    <div
      className={cn(
        'flex mt-4 w-full',
        !isUserChat && (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'),
        !isUserChat && 'p-4 items-center justify-center'
      )}
    >
      {isUserChat ? (
        <>
          <div className='w-10 h-10'>
            {!isSameUser && <StyledAvatar src={avatarUrl} name={displayName} />}
          </div>

          <div className={cn('ml-2 w-full', isSameUser && 'ml-12')}>
            {!isSameUser && (
              <div className='flex font-semibold flex-row w-full justify-between items-center mb-1'>
                <p className='text-sm'>{displayName}</p>
              </div>
            )}

            <div
              className={cn(
                'mt-0 p-1.5 w-full rounded',
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
              )}
            >
              <p>{message.content}</p>
              <p className='text-[10px] flex flex-row self-end text-right mt-1'>
                {dayjs(message.timestamp).fromNow()}
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className='text-center'>{message.content}</p>
      )}
    </div>
  );
};

export default ChatMessageDisplay;
