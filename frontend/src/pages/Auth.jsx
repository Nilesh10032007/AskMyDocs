import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, ShieldCheck, Activity, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      setMessage('Check your email for the login link!');
    } catch (error) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error.error_description || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-[#3730A3] text-white p-3 rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to DocuMind AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          Sign in to access your secure, private document intelligence platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {message && (
            <div className={`p-4 rounded-md text-sm mb-6 ${message.includes('Check') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3730A3] focus:border-[#3730A3] sm:text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#3730A3] hover:bg-[#312e81] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3730A3] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending magic link...' : 'Send Magic Link'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Chrome className="w-5 h-5 mr-2 text-red-500" />
                Sign in with Google
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center space-x-2 text-xs text-gray-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>SOC2 Compliant & AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );
}
