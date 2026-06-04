import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Subscriber } from '@/types';

export const subscriberService = {
  async addSubscriber(email: string): Promise<string | null> {
    // Check if already exists
    const q = query(collection(db, COLLECTIONS.SUBSCRIBERS), where('email', '==', email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }

    const ref = await addDoc(collection(db, COLLECTIONS.SUBSCRIBERS), {
      email,
      active: true,
      subscribedAt: serverTimestamp()
    });
    return ref.id;
  }
};
