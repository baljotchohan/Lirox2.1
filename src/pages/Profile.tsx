import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { db, auth, doc, onSnapshot } from '../lib/firebase';
import type { UserProfile } from '../types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'user_profiles', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error('ProfilePage: Firestore error', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your AI Profile</h1>
          <p className="text-gray-600">This is what Lirox has learned about you through your conversations.</p>
        </div>

        <div className="grid gap-8">
          {/* Roles Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">👤</span> Roles & Titles
            </h2>
            {profile?.roles?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.roles.map((role: string) => (
                  <div key={role} className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-blue-900 font-medium">
                    {role}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No roles identified yet. Chat more to help Lirox understand your professional identity!</p>
            )}
          </div>

          {/* Interests Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Interests
            </h2>
            {profile?.interests?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.interests.map((interest: string) => (
                  <div key={interest} className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-xl text-purple-900 font-medium">
                    {interest}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No interests identified yet. Share what you're passionate about!</p>
            )}
          </div>

          {/* Goals Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Goals
            </h2>
            {profile?.goals?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.goals.map((goal: string) => (
                  <div key={goal} className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl text-green-900 font-medium">
                    {goal}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No goals identified yet. Tell Lirox what you're working towards.</p>
            )}
          </div>

          {/* Pain Points Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Challenges
            </h2>
            {profile?.pain_points?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.pain_points.map((point: string) => (
                  <div key={point} className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl text-orange-900 font-medium">
                    {point}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No challenges identified yet.</p>
            )}
          </div>

          {/* Preferences Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎨</span> Preferences
            </h2>
            {profile?.preferences && Object.keys(profile.preferences).length > 0 ? (
              <div className="grid gap-4">
                {Object.entries(profile.preferences).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700 font-medium capitalize">{key}</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No preferences identified yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
