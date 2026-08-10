import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Plus, Settings, Trash2, MoreVertical, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import ChatView from './pages/ChatView';
import { getDocuments, deleteDocument } from './api';

function App() {
  const [docs, setDocs] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleDelete = async (e, docId) => {
    e.preventDefault(); // Prevent navigating to the chat view
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await deleteDocument(docId);
      // If we are currently viewing the deleted document, go to dashboard
      if (location.pathname === `/chat/${docId}`) {
        navigate('/');
      }
      // Refresh the list
      fetchDocs();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document");
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [location]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#f4f7fb] text-gray-900 font-sans relative overflow-hidden">
      
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden absolute top-6 left-6 z-40 p-2 bg-white rounded-lg shadow-md text-gray-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="p-6 flex items-center justify-between mb-2">
            <h1 className="label-caps font-bold text-gray-700 tracking-widest text-lg">
              DOCUMENTS
            </h1>
            <button className="md:hidden text-gray-500 hover:text-black" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
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
              {docs.slice(0, 10).map(doc => {
                const isActive = location.pathname === `/chat/${doc.id}`;
                const isMenuOpen = openMenuId === doc.id;
                return (
                  <div key={doc.id} className="relative group flex items-center">
                    <Link 
                      to={`/chat/${doc.id}`}
                      className={`flex-1 flex items-center px-3 py-2 text-sm rounded-md transition-colors truncate pr-8 ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <FileText className="w-4 h-4 mr-3 shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </Link>
                    <button 
                      onClick={() => setOpenMenuId(isMenuOpen ? null : doc.id)}
                      className="absolute right-2 p-1 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 mt-1 w-32 bg-white border border-gray-100 rounded-md shadow-lg z-50">
                        <button
                          onClick={(e) => {
                            setOpenMenuId(null);
                            handleDelete(e, doc.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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
      <div className="flex-1 overflow-auto bg-[#f4f7fb] w-full">
        <Routes>
          <Route path="/" element={<Dashboard onUploadComplete={fetchDocs} />} />
          <Route path="/chat/:docId" element={<ChatView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
