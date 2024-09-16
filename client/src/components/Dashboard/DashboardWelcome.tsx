import { useAtom } from 'jotai';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useProfileContext } from 'src/lib/UserProvider';
import { isPremiumAtom } from '../../state/isPremiumAtom';
import { getFirstName } from '../../util/helpers/getFirstName';

const DashboardWelcome = () => {
  const { profile } = useProfileContext();
  const [isPremium] = useAtom(isPremiumAtom);
  const { theme } = useTheme();

  return (
    <div className='flex  flex-col items-center justify-center'>
      <div>
        <Image src='/logo.svg' height={100} width={150} alt='Listen Together logo' />
      </div>
      <div className='text-center mb-4 md:mb-8 mt-4 md:mt-8'>
        <h1 className='text-4xl font-bold mb-2 dark:text-white'>
          {profile?.displayName
            ? `Welcome back, ${getFirstName(profile.displayName)}!`
            : 'Welcome back!'}
        </h1>
        <p className='text-xl dark:text-gray-300'>It&apos;s great to see you again.</p>
        {!isPremium && (
          <div
            className={`mt-4 border-l-4 p-4 ${
              theme === 'dark'
                ? 'bg-yellow-900 border-yellow-600 text-yellow-200'
                : 'bg-yellow-100 border-yellow-500 text-yellow-700'
            }`}
            role='alert'
          >
            <div className='flex'>
              <div className='py-1'>
                <svg
                  className={`fill-current h-6 w-6 mr-4 ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                  }`}
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <path d='M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z' />
                </svg>
              </div>
              <div className='max-w-xl'>
                <p className='font-bold'>Oops! Looks like you don&apos;t have Spotify Premium.</p>
                <p
                  className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}
                >
                  Controlling playback with the Spotify API is limited to premium users. Free users
                  can still enter rooms and chat, but they won&apos;t be able to sync their music
                  with friends.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWelcome;
