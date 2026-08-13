import { useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Auth({ onLoginSuccess }) {
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // Store token and user info
      localStorage.setItem('auth_token', credentialResponse.credential);
      localStorage.setItem('user', JSON.stringify({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      }));
      
      onLoginSuccess();
      navigate('/');
    } catch (err) {
      setErrorMsg('Failed to process login. Please try again.');
      console.error(err);
    }
  };

  const handleError = () => {
    setErrorMsg('Google Login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] bg-dot-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-indigo-600 text-white p-3 rounded-xl mb-4 shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white">
          Welcome to Ask My Docs
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400 max-w">
          Sign in to access your secure, private document intelligence platform.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#151821] py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-2xl sm:px-10 border border-white/5 flex flex-col items-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

          {errorMsg && (
            <div className="p-4 rounded-xl text-sm mb-6 w-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="w-full flex justify-center mt-2 mb-4">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              shape="rectangular"
              theme="filled_black"
              size="large"
              text="continue_with"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-center items-center space-x-2 text-xs text-gray-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>SOC2 Compliant & AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );
}
