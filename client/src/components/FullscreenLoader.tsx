import { Spinner } from './atoms';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export default function FullscreenLoader() {
  const { theme } = useTheme();

  return (
    <div className='bg-transparent h-screen w-screen flex flex-col items-center justify-center gap-4'>
      <div>
        <Image
          src={theme === 'light' ? '/logo.svg' : '/logo.svg'}
          height={100}
          width={150}
          alt='Listen Together logo'
        />
      </div>
      <Spinner />
    </div>
  );
}
