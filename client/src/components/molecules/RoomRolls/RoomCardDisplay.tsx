import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMusic } from 'react-icons/fi';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';

import { getFirestoreDB } from '@/utils/configs/firebase-app-config';
import useSpotifyTrack from '@/hooks/spotify/useSpotifyTrack';
import useGradientsFromImageRef from '@/hooks/useGradientsFromImageRef';
import Room from '@/utils/models/Room';
import Song from '@/utils/models/Song';



interface Props {
  room: Room;
}

const RoomCardDisplay = ({ room }: Props) => {
  const router = useRouter();
  const db = getFirestoreDB();
  const [song, setSong] = useState<Song>();
  const track = useSpotifyTrack(song);
  const { normalGradient, hoverGradient } = useGradientsFromImageRef(
    track ? track.album.images[0].url : undefined
  );

  useEffect(() => {
    if (!room) return;

    const fetchSong = async () => {
      const songsRef = collection(db, 'songs');
      const q = query(songsRef, where('roomId', '==', room.id), limit(1));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const songData = querySnapshot.docs[0].data() as Song;
          setSong({ ...songData, id: querySnapshot.docs[0].id });
        }
      } catch (error) {
        console.error('Error fetching song:', error);
      }
    };

    fetchSong();
  }, [db, room]);

  return (
    <div
      className='bg-[#edeff5] border-gray-300/20  dark:bg-gray-700/40 backdrop-blur-sm border dark:border-gray-700/20 
                 shadow-xs rounded-xl overflow-hidden transition-all duration-300 
                 dark:hover:bg-gray-700/40 hover:shadow-xs cursor-pointer
                 h-[290px] p-4 text-left relative flex flex-col'
      onClick={() => router.push(`/rooms/${room.slug}`)}
    >
      <h3 className='text-lg font-semibold dark:text-gray-100'>{room.name}</h3>
      <h3 className='text-sm font-semibold mb-3 text-[#541413] dark:text-[#E6D5C0] dark:opacity-80'>
        NFT ID: {room.nftId}
      </h3>
      {track ? (
        <div className='flex-grow flex flex-col'>
          <img
            src={track.album.images[0].url}
            alt={`${track.album.name} cover`}
            className='w-full h-40 object-cover rounded-md mb-2'
          />
          <p className='text-sm font-medium dark:text-gray-200 truncate'>{track.name}</p>
          <p className='text-xs dark:text-gray-500 truncate'>{track.artists[0].name}</p>
          <p className='text-xs text-gray-500 truncate'>{track.album.name}</p>
        </div>
      ) : (
        <div className='flex-grow flex flex-col items-center justify-center'>
          <FiMusic className='text-6xl text-gray-600 mb-4' />
          <p className='text-sm text-gray-400 text-center'>Be the first to play something!</p>
        </div>
      )}
    </div>
  );
};

export default RoomCardDisplay;
