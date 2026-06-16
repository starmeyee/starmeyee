"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { firestoreService } from '@/lib/firebase/services/firestore';
import { User, Role } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminEmail } from '@/config/admin';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // Maintain a lightweight presence cookie so middleware can redirect
      // unauthenticated visitors away from /admin before the page renders.
      // NOTE: this is UX/defense-in-depth only — the real security boundary is
      // Firestore Security Rules + the client-side AdminGuard.
      if (typeof document !== 'undefined') {
        if (firebaseUser) {
          document.cookie = `sm_session=1; path=/; max-age=3600; samesite=lax`;
        } else {
          document.cookie = `sm_session=; path=/; max-age=0; samesite=lax`;
        }
      }

      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await firestoreService.getDocument<User>('users', firebaseUser.uid);
          if (userDoc) {
            // Promote allowlisted accounts that were created without an
            // elevated role (e.g. via the create-admin script).
            if (isAdminEmail(firebaseUser.email) && userDoc.role !== 'owner') {
              await firestoreService.updateDocument<User>('users', firebaseUser.uid, {
                role: 'owner',
                updatedAt: new Date(),
              });
              userDoc.role = 'owner';
            }
            setProfile(userDoc);
          } else {
            // Auto-create profile. Allowlisted emails become owners; everyone
            // else gets the default "user" role (no admin access).
            const role: Role = isAdminEmail(firebaseUser.email) ? 'owner' : 'user';
            const newProfile: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await firestoreService.setDocument('users', firebaseUser.uid, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
