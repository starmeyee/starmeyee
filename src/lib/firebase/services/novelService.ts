import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Novel, NovelCategory } from '@/types';
import { getDocsWithTimeout, getDocWithTimeout } from '../utils';

export const novelService = {
  async getAllNovels(): Promise<Novel[]> {
    const q = query(
      collection(db, COLLECTIONS.NOVELS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocsWithTimeout(q, 'novelService.getAllNovels');
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Novel));
  },

  async getNovelById(id: string): Promise<Novel | null> {
    const snap = await getDocWithTimeout(doc(db, COLLECTIONS.NOVELS, id), 'novelService.getNovelById');
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Novel) : null;
  },

  async getNovelBySlug(slug: string): Promise<Novel | null> {
    const q = query(collection(db, COLLECTIONS.NOVELS), where('slug', '==', slug));
    const snap = await getDocsWithTimeout(q, 'novelService.getNovelBySlug');
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Novel);
  },


  async createNovel(data: Omit<Novel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.NOVELS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  },

  async updateNovel(id: string, data: Partial<Novel>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOVELS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteNovel(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOVELS, id));
  },

  async getAllCategories(): Promise<NovelCategory[]> {
    const q = query(
      collection(db, COLLECTIONS.NOVEL_CATEGORIES),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocsWithTimeout(q, 'novelService.getAllCategories');
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NovelCategory));
  },


  async createCategory(data: Omit<NovelCategory, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.NOVEL_CATEGORIES), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOVEL_CATEGORIES, id));
  }
};
