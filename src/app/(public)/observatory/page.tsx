import { galleryService } from '@/lib/firebase/services/galleryService';
import { GalleryItem } from '@/types';
import ObservatoryClient from '@/components/public/ObservatoryClient';

export const metadata = {
  title: 'The Observatory | StarMeyee',
  description: 'A curated gallery of visions, moments, and starry-eyed wonders.',
};

export default async function ObservatoryPage() {
  let items: GalleryItem[] = [];
  try {
    items = await galleryService.getAllGalleryItems();
  } catch (error) {
    console.error('Error fetching gallery items on server:', error);
  }

  return <ObservatoryClient initialItems={items} />;
}

