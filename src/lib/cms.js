import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
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

export const useCmsDoc = (docId, fallbackValue) => {
  const [data, setData] = useState(fallbackValue);
  const [loading, setLoading] = useState(() => Boolean(docId));
  const [error, setError] = useState(() => (docId ? null : new Error('Missing Firestore document id.')));
  const [exists, setExists] = useState(false);
  const fallbackRef = useRef(fallbackValue);

  useEffect(() => {
    fallbackRef.current = fallbackValue;
  }, [fallbackValue]);

  useEffect(() => {
    if (!docId) {
      return undefined;
    }

    const unsubscribe = subscribeCmsDoc(
      docId,
      (value) => {
        setExists(!!value);
        setData(value || fallbackRef.current);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setData(fallbackRef.current);
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
