import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import type { HomepageSection } from '@/types';

export const homepageService = {
  async getAllSections(): Promise<HomepageSection[]> {
    try {
      const colRef = collection(db, COLLECTIONS.HOMEPAGE_SECTIONS);
      const q = query(colRef, orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
      })) as HomepageSection[];
    } catch (error) {
      console.error('Error fetching homepage sections:', error);
      throw error;
    }
  },

  async createSection(
    data: Omit<HomepageSection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const colRef = collection(db, COLLECTIONS.HOMEPAGE_SECTIONS);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating homepage section:', error);
      throw error;
    }
  },

  async updateSection(id: string, data: Partial<HomepageSection>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.HOMEPAGE_SECTIONS, id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() } as any);
    } catch (error) {
      console.error('Error updating homepage section:', error);
      throw error;
    }
  },

  async deleteSection(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.HOMEPAGE_SECTIONS, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting homepage section:', error);
      throw error;
    }
  },

  /** Batch update displayOrder for all sections. orderedIds[0] gets order 0, etc. */
  async reorderSections(orderedIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      orderedIds.forEach((id, index) => {
        const docRef = doc(db, COLLECTIONS.HOMEPAGE_SECTIONS, id);
        batch.update(docRef, { displayOrder: index, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error reordering homepage sections:', error);
      throw error;
    }
  },
};
