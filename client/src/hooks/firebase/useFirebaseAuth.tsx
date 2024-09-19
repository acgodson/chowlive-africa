import { useEffect, useState } from 'react';
import { getAuth, signInWithCustomToken, User } from 'firebase/auth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { initializeFirebase } from '@/util/firebase';

export const useFirebaseAuth = () => {
  initializeFirebase();
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const handleSignIn = async (token: string) => {
    const userCredential = await signInWithCustomToken(auth, token);
    setUser(userCredential.user);
    Cookies.set('auth_token', token, { expires: 7, secure: true });
    router.push('/');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('auth_token');
      if (token) {
        try {
          await handleSignIn(token);
        } catch (error) {
          console.error('Error initializing with stored token:', error);
          Cookies.remove('auth_token');
        }
      }
      setIsSessionLoading(false);
    };

    initializeAuth();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    Cookies.remove('auth_token');
  };

  return { user, signOut, isSessionLoading, handleSignIn };
};
