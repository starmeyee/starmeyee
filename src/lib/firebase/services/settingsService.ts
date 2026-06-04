import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import type { SiteSettings } from '@/types';
import { getDocWithTimeout } from '../utils';

const SETTINGS_ID = 'main';

export const settingsService = {
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_ID);
      const snap = await getDocWithTimeout(docRef, 'settingsService.getSettings');
      if (!snap.exists()) return null;
      return {

        id: snap.id,
        ...snap.data(),
        updatedAt: snap.data().updatedAt?.toDate?.() ?? new Date(),
      } as SiteSettings;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      throw error;
    }
  },

  async saveSettings(
    data: Omit<SiteSettings, 'id' | 'updatedAt'>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SITE_SETTINGS, SETTINGS_ID);
      await setDoc(
        docRef,
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving site settings:', error);
      throw error;
    }
  },
};
