import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, Link } from 'react-router-dom';
import { Cloud, Cpu, Database, Search, User, FileText, UploadCloud, File, FileCode, CheckCircle, Clock, MoreVertical, ArrowRight, Activity, ShieldCheck, Plus } from 'lucide-react';
import { uploadDocument, getDocuments } from '../api';

export default function Dashboard({ onUploadComplete }) {
  const [docs, setDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      await uploadDocument(acceptedFiles[0], (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      await loadDocs();
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Alex' };
  const userFirstName = user.name ? user.name.split(' ')[0] : 'Alex';

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-24 md:pb-8 font-sans">
      
      {/* ==================== MOBILE VIEW (Figma Style) ==================== */}
      <div className="md:hidden p-4 space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Dashboard</h2>
          </div>
          <div className="w-8 h-8 bg-indigo-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            {user.picture ? (
              <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#3730A3] font-bold text-sm">{userFirstName[0]}</span>
            )}
          </div>
        </div>

        {/* Hello Banner */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {userFirstName}.</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">What are we analyzing today?</p>
        </div>

        {/* Quick Upload Card */}
        <div 
          {...getRootProps()} 
          className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-100 transition-colors"
        >
          <input {...getInputProps()} />
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-50 text-[#3730A3] rounded-xl flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Quick Upload'}
              </p>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">PDF, Word, or Image</p>
            </div>
          </div>
          <button 
            type="button"
            className="bg-[#3730A3] hover:bg-[#312e81] text-white text-[11px] font-extrabold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10"
          >
            Select
          </button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => navigate('/chat')}
              className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2 hover:border-indigo-100 transition-colors"
            >
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-700">New Chat</span>
            </button>
            <button 
              onClick={() => navigate('/library')}
              className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2 hover:border-indigo-100 transition-colors"
            >
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-700">Summarize</span>
            </button>
            <button 
              onClick={() => navigate('/library')}
              className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2 hover:border-indigo-100 transition-colors"
            >
              <div className="w-9 h-9 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-700">Tags</span>
            </button>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Documents</h3>
            <Link to="/library" className="text-[11px] font-bold text-indigo-600 hover:underline">
              View All →
            </Link>
          </div>
          
          <div className="space-y-3">
            {docs.slice(0, 3).map(doc => {
              const fileSizeMB = (doc.size / 1024 / 1024).toFixed(1);
              return (
                <Link 
                  key={doc.id} 
                  to={`/chat/${doc.id}`}
                  className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.filename.endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate pr-2">{doc.filename}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        Today • {fileSizeMB} MB • <span className="text-green-600 font-bold">Analyzed</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              );
            })}
            {docs.length === 0 && (
              <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-semibold">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:block p-8 max-w-6xl mx-auto space-y-8">
        {/* Top Navbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#3730A3] text-white p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">DocuMind AI</span>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search docs..." 
                className="w-full pl-10 pr-4 py-2 bg-[#EBF1FF] border-none rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
          </div>

          <div className="flex w-10 h-10 bg-[#3730A3] rounded-full items-center justify-center text-white shrink-0">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'TOTAL UPLOADS', value: docs.length.toString(), icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'TOKENS PROCESSED', value: '4.2M', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'STORAGE USED', value: '84%', icon: Database, color: 'text-slate-500', bg: 'bg-slate-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 soft-shadow flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="label-caps text-gray-400 text-xs font-semibold mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Hero */}
        <div 
          {...getRootProps()} 
          className={`bg-white rounded-2xl p-12 soft-shadow border-2 border-dashed transition-all cursor-pointer relative overflow-hidden group
            ${isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:border-indigo-200'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <input {...getInputProps()} />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-20 bg-blue-50 rounded-lg flex flex-col items-center justify-center text-blue-600 border border-blue-100 shadow-sm -rotate-6 transform hover:rotate-0 transition-transform">
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">PDF</span>
              </div>
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border-4 border-white shadow-md z-10">
                <Plus className="w-8 h-8" />
              </div>
              <div className="w-16 h-20 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-600 border border-slate-200 shadow-sm rotate-6 transform hover:rotate-0 transition-transform">
                <File className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">DOCX</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Drop your intelligence here</h2>
            <p className="text-base text-gray-500 mb-8 max-w-sm">
              Drag and drop PDF, DOCX, or TXT files to instantly index them for AI-powered querying.
            </p>

            <button className="bg-[#3730A3] hover:bg-[#312e81] text-white px-8 py-3 rounded-lg text-base font-medium shadow-lg shadow-indigo-500/25 transition-all mb-8 flex items-center justify-center">
               <UploadCloud className="w-5 h-5 mr-2" /> 
               {isUploading ? `Uploading... ${uploadProgress}%` : 'Select Local Files'}
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium">
              <span>Supported formats:</span>
              <FileText className="w-4 h-4" />
              <File className="w-4 h-4" />
              <FileCode className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Recently Uploaded */}
        <div className="bg-white rounded-xl soft-shadow overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recently Uploaded</h3>
              <p className="text-sm text-gray-500">Live tracking of your document ingestion pipeline</p>
            </div>
            <div className="flex items-center justify-end space-x-4">
              {selectedDocs.length > 1 && (
                <Link to={`/chat/${selectedDocs.join(',')}`} className="bg-[#3730A3] hover:bg-[#312e81] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all whitespace-nowrap">
                  Chat Selected
                </Link>
              )}
              <Link to="/library" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center whitespace-nowrap">
                FULL LIBRARY <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3 px-4 w-12 text-center"></th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-400 label-caps">DOCUMENT NAME</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-400 label-caps">DATE ADDED</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-400 label-caps">SIZE</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-400 label-caps">STATUS</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-400 label-caps text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => handleSelectDoc(doc.id)}
                        disabled={doc.status !== 'INDEXED'}
                        className="w-4 h-4 text-[#3730A3] rounded border-gray-300 focus:ring-[#3730A3] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="py-4 px-6 flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0
                        ${doc.filename.endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[250px]">{doc.filename}</p>
                        <p className="text-xs text-gray-400">Knowledge Base</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {doc.status === 'INDEXED' ? (
                        <span className="inline-flex items-center text-xs font-medium text-green-700">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" /> INDEXED
                        </span>
                      ) : doc.status === 'FAILED' ? (
                        <span className="inline-flex items-center text-xs font-medium text-red-700" title={doc.error}>
                          <span className="w-2 h-2 rounded-full bg-red-600 mr-2" /> FAILED
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-blue-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse" /> PROCESSING...
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {doc.status === 'INDEXED' ? (
                        <Link to={`/chat/${doc.id}`} className="inline-flex items-center justify-center px-4 py-1.5 bg-[#E0E7FF] text-[#3730A3] text-xs font-bold rounded hover:bg-indigo-100 transition-colors">
                          CHAT NOW
                        </Link>
                      ) : doc.status === 'FAILED' ? (
                        <button className="text-red-400 hover:text-red-600 cursor-help" title={doc.error}>
                          <Activity className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                      No documents uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#3730A3] text-white rounded-2xl p-8 relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-4 relative z-10">Connect your entire<br/>workspace.</h3>
            <p className="text-indigo-200 text-sm mb-8 max-w-sm relative z-10">
              Sync with Google Drive, Notion, or Slack to automatically feed documents into your AI library.
            </p>
            <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center hover:bg-indigo-50 transition-colors relative z-10">
              Explore Integrations <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          
          <div className="bg-[#DBEAFE] rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center text-[#3730A3] mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-xs">
              All documents are encrypted and siloed. Your data is never used to train global models.
            </p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 bg-white/50 border border-white text-gray-600 text-xs font-bold rounded-full">SOC2 Compliant</span>
              <span className="px-3 py-1 bg-white/50 border border-white text-gray-600 text-xs font-bold rounded-full">AES-256</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
