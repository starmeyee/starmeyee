import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import type { SocialLink } from '@/types';

export const socialService = {
  async getAllSocialLinks(): Promise<SocialLink[]> {
    try {
      const colRef = collection(db, COLLECTIONS.SOCIAL_LINKS);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SocialLink[];
    } catch (error) {
      console.error('Error fetching social links:', error);
      throw error;
    }
  },

  async saveSocialLink(data: Omit<SocialLink, 'id'>): Promise<string> {
    try {
      const colRef = collection(db, COLLECTIONS.SOCIAL_LINKS);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving social link:', error);
      throw error;
    }
  },

  async updateSocialLink(id: string, data: Partial<SocialLink>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SOCIAL_LINKS, id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() } as any);
    } catch (error) {
      console.error('Error updating social link:', error);
      throw error;
    }
  },

  async deleteSocialLink(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SOCIAL_LINKS, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
  },

  /** If no social links exist, seed with a default Instagram entry. */
  async initializeDefaults(): Promise<void> {
    try {
      const links = await socialService.getAllSocialLinks();
      if (links.length === 0) {
        await socialService.saveSocialLink({
          platform: 'Instagram',
          url: 'https://www.instagram.com/star_meyee/',
          displayOrder: 0,
          enabled: true,
        });
      }
    } catch (error) {
      console.error('Error initializing default social links:', error);
      throw error;
    }
  },
};
