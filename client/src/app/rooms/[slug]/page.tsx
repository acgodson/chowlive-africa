import { notFound } from 'next/navigation';
import RoomView from '@/components/organisms/Room/RoomView';

export default function RoomPage({ params }: { params: { slug?: string } }) {
  const slug = params.slug;

  if (!slug) {
    notFound();
  }

  return (
    <>
      <RoomView slug={slug} />
    </>
  );
}
