import { useState, useEffect } from 'react';
import { db, auth, doc, onSnapshot } from '../lib/firebase';

export default function ProfilePanel() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'user_profiles', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      } else {
        setProfile({
          roles: [],
          interests: [],
          goals: [],
          pain_points: []
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in ProfilePanel:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 max-h-[600px] overflow-y-auto shadow-sm">
      <div>
        <h2 className="font-bold text-gray-900 mb-1">What I Know About You</h2>
        <p className="text-xs text-gray-500">Lirox learns more with each conversation</p>
      </div>

      {profile?.roles?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">👤 Roles</p>
          <div className="flex flex-wrap gap-2">
            {profile.roles.map((role: string) => (
              <span key={role} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.interests?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">⚡ Interests</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest: string) => (
              <span key={interest} className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.goals?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">🎯 Goals</p>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((goal: string) => (
              <span key={goal} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-sm font-medium">
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.pain_points?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">⚠️ Challenges</p>
          <div className="flex flex-wrap gap-2">
            {profile.pain_points.map((point: string) => (
              <span key={point} className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-sm font-medium">
                {point}
              </span>
            ))}
          </div>
        </div>
      )}

      {!profile?.roles?.length && !profile?.interests?.length && !profile?.goals?.length && !profile?.pain_points?.length && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm italic">Nothing learned yet. Keep chatting!</p>
        </div>
      )}
    </div>
  );
}
