import { useState } from 'react';
import { User, LogOut, Shield, ChevronRight, Moon, Bell, Globe, HelpCircle, MessageSquare, Info } from 'lucide-react';

export default function Settings({ session, handleLogout }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const user = session?.user || {
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.com',
    picture: null
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-24 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <span className="text-xl font-bold text-gray-900">Settings</span>
        <div className="w-8 h-8 bg-indigo-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
          {user.picture ? (
            <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-[#3730A3]" />
          )}
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full overflow-hidden flex items-center justify-center">
              {user.picture ? (
                <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#3730A3] font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{user.name || 'User'}</p>
              <p className="text-xs text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Storage Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm space-y-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Storage</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Used: 4.2 MB of 100 MB</span>
            <span className="text-xs font-bold text-indigo-600">4.2%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#3730A3] h-full rounded-full" style={{ width: '4.2%' }} />
          </div>
          <button className="w-full bg-indigo-50 hover:bg-indigo-100/70 text-[#3730A3] text-xs font-bold py-3 rounded-xl transition-colors">
            Upgrade Plan
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden divide-y divide-gray-50">
          <div className="p-4 px-5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preferences</span>
          </div>
          
          <div className="p-4 px-5 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-gray-700">
              <Moon className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={() => setDarkMode(!darkMode)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3730A3]"></div>
            </label>
          </div>

          <div className="p-4 px-5 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-gray-700">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold">Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={() => setNotifications(!notifications)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3730A3]"></div>
            </label>
          </div>

          <div className="p-4 px-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/55 transition-colors">
            <div className="flex items-center space-x-3 text-gray-700">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold">Language</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-400">
              <span className="text-xs font-bold text-gray-500">English</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden divide-y divide-gray-50">
          <div className="p-4 px-5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Support</span>
          </div>

          <div className="p-4 px-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/55 transition-colors">
            <div className="flex items-center space-x-3 text-gray-700">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold">Help Center</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="p-4 px-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/55 transition-colors">
            <div className="flex items-center space-x-3 text-gray-700">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold">Community Forum</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="p-4 px-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/55 transition-colors">
            <div className="flex items-center space-x-3 text-gray-700">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold">About Ask My Docs</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Sign Out */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white hover:bg-red-50 text-red-600 text-xs font-bold py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

      </div>
    </div>
  );
}
