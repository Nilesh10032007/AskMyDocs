import { useState } from 'react';
import { User, LogOut, Shield, ChevronRight, Moon, Bell, Globe, HelpCircle, MessageSquare, Info, Cloud, Sliders, Edit2, ChevronDown, Settings as SettingsIcon } from 'lucide-react';

export default function Settings({ session, handleLogout }) {
  const [activeTab, setActiveTab] = useState('Account');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const user = session?.user || {
    name: 'Alex Miller',
    email: 'alex.miller@example.com',
    picture: null
  };
  
  const firstName = user.name ? user.name.split(' ')[0] : 'Alex';
  const lastName = user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : 'Miller';

  return (
    <div className="h-full bg-transparent p-4 md:p-8 font-sans overflow-auto relative">
      
      {/* ==================== MOBILE VIEW ==================== */}
      <div className="md:hidden space-y-6 pb-24">
        <div className="bg-[#151821] border-b border-white/5 px-4 py-3 flex items-center justify-between z-30">
          <span className="text-xl font-bold text-white">Settings</span>
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            {user.picture ? (
              <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-400 font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Mobile Profile Card */}
          <div className="bg-[#1a1d27] p-4 rounded-2xl border border-white/5 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full overflow-hidden flex items-center justify-center">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-400 font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>

          <div className="bg-[#1a1d27] rounded-2xl border border-white/5 shadow-sm overflow-hidden divide-y divide-white/5">
             <div className="p-4 px-5"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preferences</span></div>
             <div className="p-4 px-5 flex items-center justify-between">
               <div className="flex items-center space-x-3 text-gray-200">
                 <Moon className="w-4 h-4 text-gray-400" />
                 <span className="text-xs font-semibold">Dark Mode</span>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                 <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
               </label>
             </div>
          </div>
          
          <button onClick={handleLogout} className="w-full bg-[#1a1d27] hover:bg-red-500/10 text-red-400 text-xs font-bold py-4 rounded-2xl border border-white/5 shadow-sm flex items-center justify-center space-x-2 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif-heading font-bold text-white tracking-tight">Settings</h1>
            <p className="text-gray-400 mt-1 text-sm">Manage your account, preferences, and workspace configuration.</p>
          </div>
          <div className="bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> All systems operational
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex gap-8">
          
          {/* Left Sidebar Navigation */}
          <div className="w-64 shrink-0 flex flex-col space-y-8">
            <nav className="space-y-2">
              {[
                { name: 'Account', icon: User },
                { name: 'Storage', icon: Cloud },
                { name: 'Preferences', icon: Sliders },
                { name: 'Support', icon: HelpCircle }
              ].map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.name 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.name ? 'text-white' : 'text-gray-500'}`} />
                  {tab.name}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <div className="bg-[#151821] rounded-2xl p-6 border border-white/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
                <h4 className="font-bold text-white mb-1 relative z-10 text-lg">Pro Plan</h4>
                <p className="text-xs text-gray-400 mb-6 relative z-10 font-medium leading-relaxed">You're currently on the Pro plan.<br/>Billed annually.</p>
                <button className="w-full bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-bold py-2.5 rounded-lg border border-white/10 transition-colors relative z-10">
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {activeTab === 'Account' && (
              <div className="bg-[#151821] rounded-3xl p-8 lg:p-12 soft-shadow border border-white/5">
                <h3 className="font-serif-heading font-bold text-2xl text-white mb-1">Account Profile</h3>
                <p className="text-sm text-gray-400 mb-8 border-b border-white/10 pb-6 font-medium">Manage your personal information and security settings.</p>

                <div className="flex items-center space-x-5 mb-10">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-500/20 flex items-center justify-center border-4 border-[#151821] shadow-md text-indigo-400">
                      {user.picture ? (
                        <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-3xl">{firstName[0]}</span>
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-500 transition-colors border-2 border-[#151821]">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{user.name}</h4>
                    <p className="text-sm text-gray-400 font-medium mb-3">{user.email}</p>
                    <div className="flex space-x-2">
                      <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-full">Administrator</span>
                      <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-indigo-500/30">Pro User</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2">First Name</label>
                      <input 
                        type="text" 
                        defaultValue={firstName}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:bg-[#1a1d27] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        defaultValue={lastName}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:bg-[#1a1d27] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:bg-[#1a1d27] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2">Timezone</label>
                    <div className="relative">
                      <select className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer transition-all">
                        <option>Pacific Time (PT) - US & Canada</option>
                        <option>Eastern Time (ET) - US & Canada</option>
                        <option>Greenwich Mean Time (GMT)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab !== 'Account' && (
              <div className="bg-[#151821] rounded-3xl p-8 soft-shadow border border-white/5 h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
                <SettingsIcon className="w-12 h-12 mb-4 text-gray-500" />
                <p className="font-medium text-sm">Settings for {activeTab} will go here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
