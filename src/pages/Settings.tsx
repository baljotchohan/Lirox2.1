import Header from '../components/Header';
import { auth, signOut } from '../lib/firebase';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-8">
          {/* Appearance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🎨</span> Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-semibold block">Theme</label>
                  <p className="text-sm text-gray-500">Choose your preferred visual style.</p>
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium">
                  <option>Light (Default)</option>
                  <option disabled>Dark (Coming Soon)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">👤</span> Account
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-semibold block">Email Address</label>
                  <p className="text-sm text-gray-500">{auth.currentUser?.email}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Verified</span>
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                <button 
                  onClick={() => signOut(auth)}
                  className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition"
                >
                  Sign Out of Lirox
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span> Data Management
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Lirox uses your conversation data to build a personalized profile. You can export or clear this data at any time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition">
                  Export Your Data
                </button>
                <button className="px-4 py-3 border border-red-200 rounded-xl text-red-700 hover:bg-red-50 font-semibold transition">
                  Clear All Conversations
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
