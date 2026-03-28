import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
        <div className="mb-8">
          <span className="text-6xl">🧠</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Lirox</h1>
          <p className="text-gray-600 mt-2">Your Personal AI Companion</p>
        </div>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Sign in to start your personalized AI journey. Lirox learns from your conversations to better assist you.
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Sign in with Google
          </button>
        </div>
        
        <div className="mt-12 text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
