import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { db, auth, collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from '../lib/firebase';
import { chatWithLirox, extractProfileFacts } from '../services/gemini';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ChatPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch profile for context
    const fetchProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'user_profiles', auth.currentUser!.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data());
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
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Firestore Error in ChatPanel:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: 'user', // Simplified for now, we'll map correctly
        content: m.user_message
      })).concat(messages.map(m => ({
        role: 'model',
        content: m.assistant_response
      })));
      
      // We need a better history mapper, but for now let's just use the last few
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

        const updatedProfile = {
          roles: Array.from(new Set([...(existingProfile.roles || []), ...(facts.roles || [])])),
          interests: Array.from(new Set([...(existingProfile.interests || []), ...(facts.interests || [])])),
          goals: Array.from(new Set([...(existingProfile.goals || []), ...(facts.goals || [])])),
          pain_points: Array.from(new Set([...(existingProfile.pain_points || []), ...(facts.pain_points || [])])),
          preferences: { ...(existingProfile.preferences || {}), ...(facts.preferences || {}) },
          updated_at: serverTimestamp()
        };

        await setDoc(profileRef, updatedProfile);
        setProfile(updatedProfile);
      }

    } catch (error) {
      console.error('Error in handleSend:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
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
