import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { GalleryItem } from '@/types';
import { storageService } from './storage';
import { getDocsWithTimeout } from '../utils';

export const galleryService = {
  async getAllGalleryItems(): Promise<GalleryItem[]> {
    const q = query(
      collection(db, COLLECTIONS.GALLERY_ITEMS),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocsWithTimeout(q, 'galleryService.getAllGalleryItems');
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
  },


  async addGalleryItem(data: Omit<GalleryItem, 'id' | 'createdAt' | 'imageUrl'> & { imageFile: File }): Promise<string> {
    const path = `gallery/${Date.now()}_${data.imageFile.name}`;
    const imageUrl = await storageService.uploadFile(path, data.imageFile);

    const ref = await addDoc(collection(db, COLLECTIONS.GALLERY_ITEMS), {
      title: data.title,
      description: data.description,
      featuredOnHomepage: data.featuredOnHomepage,
      featuredInObservatory: data.featuredInObservatory,
      displayOrder: data.displayOrder,
      imageUrl,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async updateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.GALLERY_ITEMS, id), data);
  },

  async deleteGalleryItem(id: string, imageUrl: string): Promise<void> {
    try {
      await storageService.deleteFile(imageUrl);
    } catch (e) {
      console.warn("Image already deleted or not found in storage", e);
    }
    await deleteDoc(doc(db, COLLECTIONS.GALLERY_ITEMS, id));
  }
};
