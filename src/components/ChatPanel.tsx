import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { db, auth, collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from '../lib/firebase';
import { chatWithLirox, extractProfileFacts } from '../services/gemini';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Message, UserProfile } from '../types';

const MAX_MESSAGE_LENGTH = 5000;

const defaultProfile: UserProfile = {
  roles: [],
  interests: [],
  goals: [],
  pain_points: [],
  preferences: {},
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch profile for context
    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'user_profiles', auth.currentUser!.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        }
      } catch (err) {
        console.error('ChatPanel: failed to fetch profile', err);
        setError('Could not load your profile. Please refresh the page.');
      }
    };
    fetchProfile();

    // Fetch messages
    const q = query(
      collection(db, 'conversations'),
      where('user_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    }, (err) => {
      console.error("Firestore Error in ChatPanel:", err);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser || loading) return;
    if (input.length > MAX_MESSAGE_LENGTH) {
      setError(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`);
      return;
    }

    const userMsg = input;
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const formattedHistory = messages.slice(-10).flatMap(m => [
        { role: 'user', content: m.user_message },
        { role: 'model', content: m.assistant_response }
      ]);

      const response = await chatWithLirox(userMsg, profile, formattedHistory);

      // Save to Firestore
      await addDoc(collection(db, 'conversations'), {
        user_id: auth.currentUser.uid,
        user_message: userMsg,
        assistant_response: response,
        created_at: serverTimestamp()
      });

      // Extract facts asynchronously
      const facts = await extractProfileFacts(userMsg, response);
      if (facts) {
        const profileRef = doc(db, 'user_profiles', auth.currentUser.uid);
        const existingProfile = (await getDoc(profileRef)).data() || {
          roles: [],
          interests: [],
          goals: [],
          pain_points: [],
          preferences: {}
        };

        const updatedProfile: UserProfile = {
          roles: Array.from(new Set([...(existingProfile.roles || []), ...(facts.roles || [])])),
          interests: Array.from(new Set([...(existingProfile.interests || []), ...(facts.interests || [])])),
          goals: Array.from(new Set([...(existingProfile.goals || []), ...(facts.goals || [])])),
          pain_points: Array.from(new Set([...(existingProfile.pain_points || []), ...(facts.pain_points || [])])),
          preferences: { ...(existingProfile.preferences || {}), ...(facts.preferences || {}) },
        };

        await setDoc(profileRef, { ...updatedProfile, updated_at: serverTimestamp() });
        setProfile(updatedProfile);
      }

    } catch (err) {
      console.error('Error in handleSend:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Error banner */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-4xl mb-4">🧠</p>
              <p className="text-lg font-semibold text-gray-900">Start a Conversation</p>
              <p className="text-gray-600 mt-2">Tell me about yourself. I'll learn and improve.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id || i} className="space-y-4">
            <div className="flex justify-end">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-blue-600 text-white rounded-br-none shadow-sm">
                {msg.user_message}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-none shadow-sm">
                {msg.assistant_response}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me something..."
          disabled={loading}
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
