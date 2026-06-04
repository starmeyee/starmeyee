import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from '../collections';
import { Product, ProductCategory } from '@/types';
import { getDocsWithTimeout, getDocWithTimeout } from '../utils';

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocsWithTimeout(q, 'productService.getAllProducts');
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProductById(id: string): Promise<Product | null> {
    const snap = await getDocWithTimeout(doc(db, COLLECTIONS.PRODUCTS, id), 'productService.getProductById');
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return ref.id;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  },

  async getAllCategories(): Promise<ProductCategory[]> {
    const q = query(
      collection(db, COLLECTIONS.PRODUCT_CATEGORIES),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocsWithTimeout(q, 'productService.getAllCategories');
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductCategory));
  },

  async createCategory(data: Omit<ProductCategory, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTIONS.PRODUCT_CATEGORIES), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCT_CATEGORIES, id));
  }
};
