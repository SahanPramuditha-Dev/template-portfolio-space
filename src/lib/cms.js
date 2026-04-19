import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  const pending = Promise.all(reads).then(() => undefined);
  if (!timeoutMs) return pending;
  return Promise.race([
    pending,
    new Promise((resolve) => {
      setTimeout(resolve, timeoutMs);
    }),
  ]);
};

export const subscribeCmsDoc = (docId, onChange, onError) => {
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

export const uploadCmsAsset = async (file, folder = 'uploads') => {
  const fileName = `${Date.now()}-${file.name}`.replace(/\s+/g, '_');
  const assetRef = ref(storage, `${folder}/${fileName}`);
  await uploadBytes(assetRef, file);
  return getDownloadURL(assetRef);
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

export const useAdminSession = () => {
  const { user, loading } = useAuthState();
  const isSignedIn = !!user;
  return { user, loading, isSignedIn };
};

export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
