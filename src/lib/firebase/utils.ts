import {
  getDocs as fbGetDocs,
  getDoc as fbGetDoc,
  Query,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 1500, label = 'Firebase Operation'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function getDocsWithTimeout<T = DocumentData>(q: Query<T>, label = 'getDocs'): Promise<QuerySnapshot<T>> {
  const start = Date.now();
  const side = typeof window === 'undefined' ? 'Server' : 'Client';
  try {
    const result = await withTimeout(fbGetDocs(q), 1500, label);
    console.log(`[PERF][${side}] ${label} completed in ${Date.now() - start}ms`);
    return result;
  } catch (err: any) {
    console.error(`[PERF_ERROR][${side}] ${label} failed/timed out in ${Date.now() - start}ms: ${err.message}`);
    throw err;
  }
}

export async function getDocWithTimeout<T = DocumentData>(docRef: DocumentReference<T>, label = 'getDoc'): Promise<DocumentSnapshot<T>> {
  const start = Date.now();
  const side = typeof window === 'undefined' ? 'Server' : 'Client';
  try {
    const result = await withTimeout(fbGetDoc(docRef), 1500, label);
    console.log(`[PERF][${side}] ${label} completed in ${Date.now() - start}ms`);
    return result;
  } catch (err: any) {
    console.error(`[PERF_ERROR][${side}] ${label} failed/timed out in ${Date.now() - start}ms: ${err.message}`);
    throw err;
  }
}
