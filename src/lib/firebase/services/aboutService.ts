import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { AboutSection } from '@/types';

export const aboutService = {
  async getAboutContent(): Promise<AboutSection[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.ABOUT_CONTENT));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AboutSection));
  },

  async updateAboutSection(id: string, content: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.ABOUT_CONTENT, id), {
      content,
      updatedAt: serverTimestamp()
    });
  },

  async initializeAboutSections(): Promise<void> {
    const snap = await getDocs(collection(db, COLLECTIONS.ABOUT_CONTENT));
    if (!snap.empty) return; // Already initialized

    const sections = [
      { key: 'who_am_i', label: 'Who Am I' },
      { key: 'things_i_wonder', label: 'Things I Wonder About' },
      { key: 'things_i_love', label: 'Things I Love' },
      { key: 'current_mission', label: 'Current Mission' },
      { key: 'long_form_story', label: 'Long Form Story' }
    ];

    for (const sec of sections) {
      await setDoc(doc(collection(db, COLLECTIONS.ABOUT_CONTENT), sec.key), {
        key: sec.key,
        label: sec.label,
        content: '',
        updatedAt: serverTimestamp()
      });
    }
  }
};
