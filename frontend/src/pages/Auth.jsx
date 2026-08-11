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
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100 flex flex-col items-center">
          
          {errorMsg && (
            <div className="p-4 rounded-md text-sm mb-6 w-full bg-red-50 text-red-800 border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="w-full flex justify-center mt-2 mb-4">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              shape="rectangular"
              theme="outline"
              size="large"
              text="continue_with"
            />
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
