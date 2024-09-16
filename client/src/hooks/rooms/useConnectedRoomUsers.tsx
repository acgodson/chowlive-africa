import { useEffect, useState } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp, Database } from 'firebase/database';
import { useAuthContext } from '@/lib/AuthProvider';
import { useProfileContext } from '@/lib/UserProvider';
import { getDatabase } from 'firebase/database';

export interface ConnectedRoomUser {
  user_id: string;
  name: string;
  profile_photo: string;
  online_at: string;
}

export default function useConnectedRoomUsers(roomSlug?: string): ConnectedRoomUser[] {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedRoomUser[]>([]);
  const { user } = useAuthContext();
  const { profile } = useProfileContext();
  // const app = getFirebaseApp();
  const db: Database = getDatabase();

  useEffect(() => {
    if (!roomSlug || !user) return;

    const roomRef = ref(db, `rooms/${roomSlug}/presence`);
    const userRef = ref(db, `rooms/${roomSlug}/presence/${user.uid}`);

    const userPresence: ConnectedRoomUser = {
      user_id: user.uid,
      name: user.displayName || 'Anonymous Listener',
      profile_photo: profile?.avatarUrl || '',
      online_at: new Date().toISOString(),
    };

    // Set user's presence
    set(userRef, userPresence);

    // Remove user's presence on disconnect
    onDisconnect(userRef).remove();

    // Listen for presence changes
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const presenceData = snapshot.val();
      if (presenceData) {
        const connectedUsers = Object.values(presenceData) as ConnectedRoomUser[];
        setConnectedUsers(connectedUsers);
      } else {
        setConnectedUsers([]);
      }
    });

    return () => {
      unsubscribe();
      set(userRef, null); // Remove presence when component unmounts
    };
  }, [roomSlug, user, profile, db]);

  return connectedUsers;
}
