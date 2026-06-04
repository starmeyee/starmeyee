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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { NovelChapter, NovelPage } from '@/types';

export const novelBuilderService = {
  // Chapters
  async getChaptersForNovel(novelId: string): Promise<NovelChapter[]> {
    const q = query(
      collection(db, COLLECTIONS.NOVEL_CHAPTERS),
      where('novelId', '==', novelId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NovelChapter));
  },

  async getChapterBySlug(slug: string): Promise<NovelChapter | null> {
    const q = query(
      collection(db, COLLECTIONS.NOVEL_CHAPTERS),
      where('slug', '==', slug)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as NovelChapter);
  },

  async createChapter(data: Omit<NovelChapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.NOVEL_CHAPTERS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  },

  async updateChapter(id: string, data: Partial<NovelChapter>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOVEL_CHAPTERS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteChapter(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOVEL_CHAPTERS, id));
    // Ideally we should also delete all pages under this chapter, or trigger a cloud function.
  },

  async reorderChapters(orderedIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const ref = doc(db, COLLECTIONS.NOVEL_CHAPTERS, id);
      batch.update(ref, { displayOrder: index, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  },

  // Pages
  async getPagesForChapter(chapterId: string): Promise<NovelPage[]> {
    const q = query(
      collection(db, COLLECTIONS.NOVEL_PAGES),
      where('chapterId', '==', chapterId),
      orderBy('displayOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NovelPage));
  },

  async createPage(data: Omit<NovelPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.NOVEL_PAGES), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  },

  async updatePage(id: string, data: Partial<NovelPage>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOVEL_PAGES, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deletePage(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOVEL_PAGES, id));
  },

  async reorderPages(orderedIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const ref = doc(db, COLLECTIONS.NOVEL_PAGES, id);
      batch.update(ref, { displayOrder: index, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }
};
