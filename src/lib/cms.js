import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, getDocs, onSnapshot, setDoc, serverTimestamp, deleteDoc, collection, query, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase';

export const CMS_DOCS = {
  site: 'site',
  projects: 'projects',
  certifications: 'certifications',
  skills: 'skills',
  experience: 'experience',
  blog: 'blog',
  testimonials: 'testimonials',
  services: 'services',
  openSource: 'openSource',
  resources: 'resources',
  messages: 'messages',
  faqs: 'faqs',
  maintenancePlans: 'maintenancePlans',
};

/** Firestore documents required for the home page (single-flight warm-up + listener hydration). */
export const HOMEPAGE_CMS_DOC_IDS = [
  CMS_DOCS.site,
  CMS_DOCS.projects,
  CMS_DOCS.experience,
  CMS_DOCS.skills,
  CMS_DOCS.certifications,
  CMS_DOCS.testimonials,
  CMS_DOCS.blog,
];

/**
 * Resolves after each homepage document has been read at least once from the server or local cache.
 * Used by the boot preloader so the first paint is never fed from placeholder CMS shapes.
 */
export const waitForHomepageCms = (timeoutMs = 20000) => {
  const reads = HOMEPAGE_CMS_DOC_IDS.map((id) => getDoc(doc(db, 'content', id)));
  // After migration, most of these will be collections, so we should also prefetch collections
  const collections = [
    CMS_DOCS.projects,
    CMS_DOCS.experience,
    CMS_DOCS.skills,
    CMS_DOCS.certifications,
    CMS_DOCS.testimonials,
    CMS_DOCS.blog,
  ];
  const collectionReads = collections.map((name) => getDocs(collection(db, name)));
  
  const pending = Promise.all([...reads, ...collectionReads]).then(() => undefined);
  if (!timeoutMs) return pending;
  return Promise.race([
    pending,
    new Promise((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]);
};

const MIGRATED_COLLECTIONS = [
  'projects',
  'certifications',
  'skills',
  'experience',
  'blog',
  'testimonials',
  'services',
  'resources',
  'faqs'
];

export const subscribeCmsDoc = (docId, onChange, onError) => {
  if (MIGRATED_COLLECTIONS.includes(docId)) {
    const q = query(collection(db, docId));
    return onSnapshot(
      q,
      (snapshot) => {
        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items = items.filter(item => !item.deletedAt);
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        onChange({ items });
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  }

  return onSnapshot(
    doc(db, 'content', docId),
    (snapshot) => {
      if (snapshot.exists()) {
        onChange({ id: snapshot.id, ...snapshot.data() });
      } else {
        onChange(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const saveCmsDoc = async (docId, payload) => {
  await setDoc(
    doc(db, 'content', docId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const removeCmsDoc = async (docId) => {
  await deleteDoc(doc(db, 'content', docId));
};

export const subscribeCmsCollection = (collectionName, onChange, onError) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(
    q,
    (snapshot) => {
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter out soft-deleted items
      items = items.filter(item => !item.deletedAt);
      // Sort by order field if available
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      onChange(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const saveCmsItem = async (collectionName, itemId, payload) => {
  await setDoc(
    doc(db, collectionName, itemId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const softRemoveCmsItem = async (collectionName, itemId) => {
  await setDoc(
    doc(db, collectionName, itemId),
    { deletedAt: serverTimestamp() },
    { merge: true }
  );
};

export const softRemoveMultipleCmsItems = async (collectionName, itemIds) => {
  const batch = writeBatch(db);
  itemIds.forEach(id => {
    batch.set(doc(db, collectionName, id), { deletedAt: serverTimestamp() }, { merge: true });
  });
  await batch.commit();
};

export const reorderCmsCollection = async (collectionName, items) => {
  const batch = writeBatch(db);
  items.forEach((item, index) => {
    batch.set(doc(db, collectionName, item.id), { order: index }, { merge: true });
  });
  await batch.commit();
};

export const saveContactMessage = async (payload) => {
  const newDocRef = doc(collection(db, CMS_DOCS.messages));
  await setDoc(newDocRef, {
    ...payload,
    createdAt: serverTimestamp(),
    read: false,
  });
  return newDocRef.id;
};

export const uploadCmsAsset = async (file, folder = 'uploads') => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'application/pdf',
    // Document types
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ];
  const isDocument = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ].includes(file.type);
  const maxBytes = isDocument || file.type === 'application/pdf' ? 20 * 1024 * 1024 : 8 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed: images, video, PDF, Word, Excel, PowerPoint, text.`);
  }

  if (file.size > maxBytes) {
    throw new Error('File is too large.');
  }

  const fileName = `${Date.now()}-${file.name}`.replace(/\s+/g, '_');
  const assetRef = ref(storage, `${folder}/${fileName}`);
  await uploadBytes(assetRef, file);
  return getDownloadURL(assetRef);
};

export const listCmsAssets = async (folder = 'uploads') => {
  // If listing root library, explicitly query all expected upload folders
  if (folder === 'uploads') {
    const foldersToFetch = [
      'uploads',
      'uploads/projects',
      'uploads/certifications',
      'uploads/resources',
      'uploads/replies',
      'uploads/skills',
      'uploads/experience',
      'uploads/blog',
      'uploads/services',
      // Root-level directories defined in sectionConfig
      'projects',
      'projects/projects',
      'certificates',
      'certificates/certifications',
      'resources',
      'resources/resources'
    ];
    
    const results = await Promise.all(
      foldersToFetch.map(async (folderPath) => {
        try {
          const folderRef = ref(storage, folderPath);
          const res = await listAll(folderRef);
          return await Promise.all(
            res.items.map(async (itemRef) => {
              const url = await getDownloadURL(itemRef);
              return {
                name: itemRef.name,
                fullPath: itemRef.fullPath,
                url,
              };
            })
          );
        } catch {
          // Ignore folders that haven't been created/uploaded to yet
          return [];
        }
      })
    );
    return results.flat();
  }

  // Fallback direct folder resolution for specific recursive queries
  const folderRef = ref(storage, folder);
  const res = await listAll(folderRef);
  const currentFolderFiles = await Promise.all(
    res.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        fullPath: itemRef.fullPath,
        url,
      };
    })
  );
  return currentFolderFiles;
};

export const deleteCmsAsset = async (fullPath) => {
  const assetRef = ref(storage, fullPath);
  await deleteObject(assetRef);
};

export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  return { user, loading };
};

/**
 * Subscribes to a single `content/{docId}` document.
 * `whenMissingDoc` is applied only after the first snapshot if the document does not exist (never used as initial render data).
 * Until then, `data` is `undefined` and `loading` is true.
 */
export const useCmsDoc = (docId, whenMissingDoc = null) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(() => Boolean(docId));
  const [error, setError] = useState(() => (docId ? null : new Error('Missing Firestore document id.')));
  const [exists, setExists] = useState(false);
  const whenMissingRef = useRef(whenMissingDoc);

  useEffect(() => {
    whenMissingRef.current = whenMissingDoc;
  }, [whenMissingDoc]);

  useEffect(() => {
    if (!docId) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return undefined;
    }

    const unsubscribe = subscribeCmsDoc(
      docId,
      (value) => {
        setExists(!!value);
        setError(null);
        setData(value ?? whenMissingRef.current);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setExists(false);
        setData(whenMissingRef.current ?? null);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [docId]);

  return { data, loading, error, exists, setData };
};

export const useCmsCollection = (collectionName, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeCmsCollection(
      collectionName,
      (items) => {
        setData(items);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName]);

  return { data, loading, error, setData };
};

export const useAdminSession = () => {
  const { user, loading } = useAuthState();
  const isSignedIn = !!user;
  return { user, loading, isSignedIn };
};

export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
