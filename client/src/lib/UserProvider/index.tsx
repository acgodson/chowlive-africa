import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { getDatabase, ref, get } from 'firebase/database';

import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

import SpotifyWebApi from 'spotify-web-api-js';

import { Profile } from 'src/models/Profile';

import { useAuthContext } from '../AuthProvider';

type PlatformUserContext = {
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => void;
};
const PlatformUserContext = createContext<PlatformUserContext | null>(null);

export default function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthContext();

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        setProfile(userDoc.data() as Profile);
      } else {
        console.error('User document does not exist in Firestore');
        setProfile(null);
      }

      // Fetch the Spotify access token
      const rtdb = getDatabase();
      const tokenSnapshot = await get(ref(rtdb, `spotifyAccessToken/${user.uid}`));
      const accessToken = tokenSnapshot.val();

      console.log('this access token', accessToken);

      // return;

      if (accessToken) {
        const spotify = new SpotifyWebApi();
        await spotify.setAccessToken(accessToken);

        const spotifyUser = await spotify.getMe();

        // console.log(spotifyUser);
        // Update the profile with the latest Spotify data
        const updatedProfile: Profile = {
          ...(userDoc.data() as Profile),
          isPremium: spotifyUser.product === 'premium',
          displayName: spotifyUser.display_name || profile?.displayName,
          avatarUrl: `https://eu.ui-avatars.com/api/?name=${
            spotifyUser.display_name || profile?.displayName
          }&size=250`,
        };

        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...updatedProfile,
            avatarUrl: `https://eu.ui-avatars.com/api/?name=${
              spotifyUser.display_name || profile?.displayName
            }&size=250`,
          },
          { merge: true }
        );
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  return (
    <PlatformUserContext.Provider value={{ profile, isLoading, refreshProfile }}>
      {children}
    </PlatformUserContext.Provider>
  );
}

export const useProfileContext = () => {
  const context = useContext(PlatformUserContext);

  if (context === null) {
    throw new Error('useProfileContext must be used in combination with an ProfileProvider.');
  }

  return context;
};
