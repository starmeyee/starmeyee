import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { ReadProgress } from '@/types';

export const readProgressService = {
  async saveProgress(userId: string, novelId: string, chapterId: string, pageId: string, completionPercent: number): Promise<void> {
    const progressId = `${userId}_${novelId}`;
    await setDoc(doc(db, COLLECTIONS.READ_PROGRESS, progressId), {
      id: userId,
      novelId,
      chapterId,
      pageId,
      completionPercent,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  async getProgress(userId: string, novelId: string): Promise<ReadProgress | null> {
    const progressId = `${userId}_${novelId}`;
    const snap = await getDocs(query(
      collection(db, COLLECTIONS.READ_PROGRESS),
      where('id', '==', userId),
      where('novelId', '==', novelId)
    ));
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as ReadProgress);
  }
};
