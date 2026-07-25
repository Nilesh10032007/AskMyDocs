import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import ChatView from './pages/ChatView';
import { getDocuments } from './api';

function App() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDocs = async () => {
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [location]);

  return (
    <div className="flex h-screen bg-[#f4f7fb] text-gray-900 font-sans">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center justify-between mb-2">
            <h1 className="label-caps font-bold text-gray-700 tracking-widest text-lg">
              DOCUMENTS
            </h1>
            <button className="text-gray-900 hover:text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          <div className="px-6 mb-6">
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-[#3730A3] hover:bg-[#312e81] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors soft-shadow"
            >
              <Plus className="w-4 h-4 mr-2" /> New Upload
            </button>
          </div>

          <div className="px-6 py-2">
            <h2 className="label-caps font-bold text-gray-400 text-xs mb-3">RECENT LIBRARY</h2>
            <div className="space-y-1">
              {docs.slice(0, 5).map(doc => {
                const isActive = location.pathname === `/chat/${doc.id}`;
                return (
                  <Link 
                    key={doc.id} 
                    to={`/chat/${doc.id}`}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FileText className="w-4 h-4 mr-3 shrink-0" />
                    <span className="truncate">{doc.filename}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          <button className="flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
            <Settings className="w-4 h-4 mr-3" /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#f4f7fb]">
        <Routes>
          <Route path="/" element={<Dashboard onUploadComplete={fetchDocs} />} />
          <Route path="/chat/:docId" element={<ChatView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
