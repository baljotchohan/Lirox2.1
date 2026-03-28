import { Link } from 'react-router-dom';
import { auth, signOut } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h1 className="text-2xl font-bold text-gray-900">Lirox</h1>
          <p className="text-sm text-gray-600 ml-4 hidden sm:block">Your Personal AI</p>
        </Link>
        <nav className="flex gap-6 items-center">
          <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">Profile</Link>
          <Link to="/settings" className="text-gray-700 hover:text-blue-600 font-medium">Settings</Link>
          {user && (
            <button 
              onClick={() => signOut(auth)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
            >
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
