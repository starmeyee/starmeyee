import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config';
import { getDocWithTimeout, getDocsWithTimeout } from '../utils';

export const firestoreService = {
  // Get a single document by ID
  async getDocument<T = DocumentData>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDocWithTimeout(docRef, `firestoreService.getDocument(${collectionName})`);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Get multiple documents with optional constraints
  async getDocuments<T = DocumentData>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, ...constraints);
      const querySnapshot = await getDocsWithTimeout(q, `firestoreService.getDocuments(${collectionName})`);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
    } catch (error) {
      console.error(`Error fetching documents from ${collectionName}:`, error);
      throw error;
    }
  },


  // Add a new document (auto ID)
  async addDocument<T extends DocumentData>(collectionName: string, data: T): Promise<string> {
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, data);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  // Set a document (custom ID or overwrite)
  async setDocument<T extends DocumentData>(collectionName: string, id: string, data: T, merge: boolean = true): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, data, { merge });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Update an existing document
  async updateDocument<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      // @ts-ignore - Firebase types require this workaround sometimes for generic objects
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }
};
