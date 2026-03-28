import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth, doc, onSnapshot } from '../lib/firebase';
import type { UserProfile } from '../types';

interface ProfileContextValue {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  loading: boolean;
}

const defaultProfile: UserProfile = {
  roles: [],
  interests: [],
  goals: [],
  pain_points: [],
  preferences: {},
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  setProfile: () => {},
  loading: true,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'user_profiles', auth.currentUser.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          setProfile(defaultProfile);
        }
        setLoading(false);
      },
      (error) => {
        console.error('ProfileContext: Firestore error', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
