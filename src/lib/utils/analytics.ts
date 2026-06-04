import { firestoreService } from '../firebase/services/firestore';
import { Analytics } from '@/types';

export const analyticsService = {
  async trackPageView(path: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const analyticsDoc = await firestoreService.getDocument<Analytics>('analytics', today);
      if (analyticsDoc) {
        await firestoreService.updateDocument('analytics', today, {
          pageViews: (analyticsDoc.pageViews || 0) + 1,
        });
      } else {
        await firestoreService.setDocument('analytics', today, {
          date: today,
          pageViews: 1,
          uniqueVisitors: 0,
        });
      }
    } catch (error) {
      console.error('Error tracking page view', error);
    }
  },
};
