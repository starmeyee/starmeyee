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
import { MusicItem } from '@/types';

export const musicService = {
  async getAllMusicItems(): Promise<MusicItem[]> {
    const q = query(
      collection(db, COLLECTIONS.MUSIC_ITEMS),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicItem));
  },

  async createMusicItem(data: Omit<MusicItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.MUSIC_ITEMS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  },

  async updateMusicItem(id: string, data: Partial<MusicItem>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.MUSIC_ITEMS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteMusicItem(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.MUSIC_ITEMS, id));
  }
};
