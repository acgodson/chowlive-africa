import AlwaysScrollToBottom from './AlwaysScrollToBottom';
import ChatMessageDisplay from './ChatMessageDisplay';
import { Message } from '../../../models/Message';

interface Props {
  messages: Message[];
}

const ChatDisplay = ({ messages }: Props) => {
  let lastMessage = '';
  return (
    <div>
      {messages &&
        messages.map((message, index) => {
          const id = lastMessage;
          lastMessage = message.userId;

          return (
            <ChatMessageDisplay message={message} previousUser={id} index={index} key={index} />
          );
        })}
      <AlwaysScrollToBottom />
    </div>
  );
};

export default ChatDisplay;
