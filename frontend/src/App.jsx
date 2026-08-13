import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FileText, Plus, Settings, Trash2, MoreVertical, Menu, X, LogOut, Home, Folder, Search as SearchIcon, Settings as SettingsIcon, Bell, HelpCircle, LayoutDashboard, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import ChatView from './pages/ChatView';
import Auth from './pages/Auth';
import Library from './pages/Library';
import SettingsPage from './pages/Settings';
import { getDocuments, deleteDocument } from './api';

function App() {
  const [docs, setDocs] = useState([]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setSession({ user: JSON.parse(userStr) });
    } else {
      setSession(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const fetchDocs = async () => {
    if (!session) return;
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, docId) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await deleteDocument(docId);
      if (location.pathname === `/chat/${docId}`) {
        navigate('/');
      }
      fetchDocs();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document");
    }
  };

  useEffect(() => {
    if (session) {
      fetchDocs();
    }
  }, [location, session]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setSession(null);
    navigate('/');
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">Loading...</div>;
  }

  if (!session) {
    return <Auth onLoginSuccess={checkAuth} />;
  }

  const isTabActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getPageTitle = (path) => {
    if (path === '/') return "Dashboard";
    if (path.startsWith('/library')) return "Library";
    if (path.startsWith('/chat')) return "Ask My Docs Chat";
    if (path.startsWith('/settings')) return "Settings";
    return "Ask My Docs";
  };
  
  const PageTitleIcon = () => {
    const path = location.pathname;
    if (path === '/') return <LayoutDashboard className="w-5 h-5" />;
    if (path.startsWith('/library')) return <Folder className="w-5 h-5" />;
    if (path.startsWith('/chat')) return <Search className="w-5 h-5" />;
    if (path.startsWith('/settings')) return <SettingsIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent bg-dot-pattern md:p-6 text-gray-900 font-sans relative overflow-hidden pb-16 md:pb-0">
      
      {/* Outer Header (Desktop Only) */}
      <div className="hidden md:flex items-center text-white/90 mb-4 px-2 tracking-wide">
        <PageTitleIcon />
        <span className="ml-2 font-medium text-lg">{getPageTitle(location.pathname)}</span>
      </div>

      {/* Main App Container */}
      <div className="flex-1 bg-white md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col justify-between shrink-0 z-50">
          <div>
            <div className="p-6 flex items-center text-[#3730A3] mb-4">
              <FileText className="w-6 h-6 mr-2" />
              <h1 className="font-serif-heading font-bold text-xl tracking-tight">
                Ask My Docs
              </h1>
            </div>

            <nav className="px-4 space-y-1">
              <Link 
                to="/" 
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${isTabActive('/') ? 'bg-[#3730A3] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
              </Link>
              <Link 
                to="/library" 
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${isTabActive('/library') ? 'bg-[#3730A3] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Folder className="w-5 h-5 mr-3" /> Library
              </Link>
              <Link 
                to="/chat" 
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${isTabActive('/chat') ? 'bg-[#3730A3] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Search className="w-5 h-5 mr-3" /> Deep Search
              </Link>
              <Link 
                to="/settings" 
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${isTabActive('/settings') ? 'bg-[#3730A3] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <SettingsIcon className="w-5 h-5 mr-3" /> Settings
              </Link>
            </nav>
          </div>

          <div className="p-6">
            <div className="bg-[#f8f9fc] rounded-2xl p-3 flex items-center relative group cursor-pointer border border-gray-100 transition-colors hover:bg-gray-50">
               {session.user.picture ? (
                 <img src={session.user.picture} alt="Profile" className="w-10 h-10 rounded-full mr-3 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#3730A3] flex items-center justify-center mr-3 shrink-0 font-bold">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">{session.user.name || session.user.email}</div>
                <div className="text-xs text-gray-500">Pro Plan</div>
              </div>

              {/* Logout Popover on Hover */}
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center rounded-xl">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#fcfdff] relative">
          
          {/* Top Bar (Desktop Only) */}
          <div className="hidden md:flex items-center justify-between h-20 px-8 border-b border-gray-100 shrink-0 bg-white/50 backdrop-blur-sm z-40">
            <div className="relative w-96">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search your documents..." 
                className="w-full bg-gray-100/80 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3]/20"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-[#1c1a53] hover:bg-[#14123b] text-white text-sm font-medium py-2 px-5 rounded-lg flex items-center transition-colors shadow-sm"
              >
                 New Document
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard onUploadComplete={fetchDocs} />} />
              <Route path="/library" element={<Library docs={docs} fetchDocs={fetchDocs} handleDelete={handleDelete} />} />
              <Route path="/settings" element={<SettingsPage session={session} handleLogout={handleLogout} />} />
              <Route path="/chat" element={<ChatView docs={docs} />} />
              <Route path="/chat/:docId" element={<ChatView docs={docs} />} />
            </Routes>
          </div>
        </div>

        {/* Bottom Tab Bar (Mobile Only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-50">
          <Link to="/" className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-semibold transition-colors ${isTabActive('/') ? 'text-[#3730A3]' : 'text-gray-400'}`}>
            <Home className="w-5 h-5 mb-1" /><span>Dashboard</span>
          </Link>
          <Link to="/library" className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-semibold transition-colors ${isTabActive('/library') ? 'text-[#3730A3]' : 'text-gray-400'}`}>
            <Folder className="w-5 h-5 mb-1" /><span>Library</span>
          </Link>
          <Link to="/chat" className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-semibold transition-colors ${isTabActive('/chat') ? 'text-[#3730A3]' : 'text-gray-400'}`}>
            <Search className="w-5 h-5 mb-1" /><span>Search</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-semibold transition-colors ${isTabActive('/settings') ? 'text-[#3730A3]' : 'text-gray-400'}`}>
            <SettingsIcon className="w-5 h-5 mb-1" /><span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
