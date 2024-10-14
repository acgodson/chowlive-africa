import { useForm } from 'react-hook-form';
import { useAtom } from 'jotai';
import { getDatabase, get, ref } from 'firebase/database';

import { useAuthContext } from '@/providers/web3-provider';
import { MessageType } from '@/utils/models/Message';

import { trpc } from '@/trpc/client';
import { Input } from '@/components/atoms';
import { roomAtom } from '../../../../state/roomAtom';





const ChatInput = () => {
  const { register, handleSubmit, reset } = useForm();
  const [room] = useAtom(roomAtom);
  const { user } = useAuthContext();
  const { mutateAsync: sendChatMessage } = trpc.sendChatMessage.useMutation();

  const onSubmit = handleSubmit(async (data) => {
    const { message } = data;

    if (!user) return;

    // Fetch the Spotify access token
    // const rtdb = getDatabase();
    // const tokenSnapshot = await get(
    //   ref(rtdb, `spotifyAccessToken/${user?.uid}`)
    // );
    // const accessToken = tokenSnapshot.val();

    try {
      await sendChatMessage({
        type: MessageType.UserChat,
        content: message,
        roomId: room.id,
        userId: user.uid,
      });
    } catch {
      console.error('Error sending chat message.');
    }
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="w-full h-16 px-4 z-10 grid place-items-center">
      <Input
        type="text"
        placeholder="Send a message..."
        disabled={!room.name}
        className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline disabled:bg-gray-100 disabled:text-gray-500"
        {...register('message')}
      />
    </form>
  );
};

export default ChatInput;