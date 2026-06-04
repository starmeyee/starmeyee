import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import type { NewsletterSettings } from '@/types';
import { getDocWithTimeout } from '../utils';

const SETTINGS_ID = 'main';

export const newsletterService = {
  async getSettings(): Promise<NewsletterSettings | null> {
    try {
      const docRef = doc(db, COLLECTIONS.NEWSLETTER_SETTINGS, SETTINGS_ID);
      const snap = await getDocWithTimeout(docRef, 'newsletterService.getSettings');
      if (!snap.exists()) return null;
      return {

        id: snap.id,
        ...snap.data(),
        updatedAt: snap.data().updatedAt?.toDate?.() ?? new Date(),
      } as NewsletterSettings;
    } catch (error) {
      console.error('Error fetching newsletter settings:', error);
      throw error;
    }
  },

  async saveSettings(
    data: Omit<NewsletterSettings, 'id' | 'updatedAt'>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.NEWSLETTER_SETTINGS, SETTINGS_ID);
      await setDoc(
        docRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving newsletter settings:', error);
      throw error;
    }
  },
};
