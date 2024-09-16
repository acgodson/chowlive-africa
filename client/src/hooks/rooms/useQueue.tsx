import { Queue } from '../../models/Room';
import useSongs from '../firebase/useSongs';

const useQueue = (roomID: string): Queue => useSongs(roomID).array;

export default useQueue;
