import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, Link } from 'react-router-dom';
import { Cloud, Cpu, Database, Search, User, FileText, UploadCloud, File, FileCode, CheckCircle, Clock, MoreVertical, ArrowRight, Activity, ShieldCheck, Plus, ChevronRight, MessageSquare, Tag, Folder as FolderIcon, Filter } from 'lucide-react';
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
    <div className="h-full bg-transparent p-4 md:p-8 font-sans overflow-auto">
      
      {/* ==================== MOBILE VIEW (Preserved mostly) ==================== */}
      <div className="md:hidden space-y-6">
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
          <h1 className="text-2xl font-serif-heading font-bold text-gray-900">Welcome back, {userFirstName}.</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Here's an overview of your knowledge base.</p>
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
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/chat')} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2">
              <div className="w-9 h-9 bg-indigo-50 text-[#3730A3] rounded-xl flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
              <span className="text-[10px] font-bold text-gray-700">New Chat</span>
            </button>
            <button onClick={() => navigate('/library')} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2">
              <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><FileText className="w-4 h-4" /></div>
              <span className="text-[10px] font-bold text-gray-700">Summarize</span>
            </button>
            <button className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Tag className="w-4 h-4" /></div>
              <span className="text-[10px] font-bold text-gray-700">Manage Tags</span>
            </button>
            <button className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2">
              <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><FolderIcon className="w-4 h-4" /></div>
              <span className="text-[10px] font-bold text-gray-700">Collections</span>
            </button>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Documents</h3>
            <Link to="/library" className="text-[11px] font-bold text-indigo-600 hover:underline">View All →</Link>
          </div>
          
          <div className="space-y-3">
            {docs.slice(0, 3).map(doc => {
              const fileSizeMB = (doc.size / 1024 / 1024).toFixed(1);
              return (
                <Link key={doc.id} to={`/chat/${doc.id}`} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-500"><FileText className="w-4 h-4" /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate pr-2">{doc.filename}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Today • {fileSizeMB} MB • Indexed</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>


      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:block max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif-heading font-bold text-gray-900 tracking-tight">Welcome back, {userFirstName}.</h1>
            <p className="text-gray-500 mt-1">Here's an overview of your knowledge base.</p>
          </div>
          <div className="bg-indigo-50/50 text-[#3730A3] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> System Status: Online
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column (Upload, Actions, Storage) */}
          <div className="col-span-4 space-y-6">
            
            {/* Upload Area */}
            <div 
              {...getRootProps()} 
              className={`bg-white rounded-3xl p-8 soft-shadow border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center h-64
                ${isDragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50'}`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 bg-indigo-50 text-[#3730A3] rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Drop documents here</h3>
              <p className="text-xs text-gray-500 mb-6">PDF, DOCX, TXT up to 50MB</p>
              <button className="bg-indigo-50 text-[#3730A3] hover:bg-indigo-100 px-6 py-2 rounded-full text-xs font-bold transition-colors">
                {isUploading ? `Uploading ${uploadProgress}%` : 'Browse Files'}
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/chat')} className="bg-white rounded-2xl p-5 soft-shadow flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-indigo-50 text-[#3730A3] rounded-xl flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-gray-700">New Chat</span>
              </button>
              <button onClick={() => navigate('/library')} className="bg-white rounded-2xl p-5 soft-shadow flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-gray-700">Summarize</span>
              </button>
              <button className="bg-white rounded-2xl p-5 soft-shadow flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Tag className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-gray-700">Manage Tags</span>
              </button>
              <button className="bg-white rounded-2xl p-5 soft-shadow flex flex-col items-center justify-center space-y-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><FolderIcon className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-gray-700">Collections</span>
              </button>
            </div>

            {/* Storage Progress */}
            <div className="bg-white rounded-2xl p-6 soft-shadow">
              <div className="flex justify-between text-xs font-bold text-gray-400 label-caps mb-3">
                <span>Storage</span>
                <span className="text-[#3730A3]">45%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                <div className="bg-[#3730A3] h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500">4.5 GB of 10 GB used</p>
            </div>

          </div>

          {/* Right Column (Recent Documents) */}
          <div className="col-span-8">
            <div className="bg-white rounded-3xl soft-shadow overflow-hidden h-full flex flex-col border border-gray-50">
              
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center text-[#3730A3]">
                  <Clock className="w-5 h-5 mr-2" />
                  <h3 className="font-serif-heading font-bold text-lg text-gray-900">Recent Documents</h3>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <button className="p-1 hover:text-gray-600"><Filter className="w-4 h-4" /></button>
                  <button className="p-1 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 label-caps">Name</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 label-caps">Date</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 label-caps">Size</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 label-caps">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {docs.length > 0 ? docs.map(doc => {
                      const fileSizeMB = (doc.size / 1024 / 1024).toFixed(1);
                      const isPdf = doc.filename.endsWith('.pdf');
                      const isDocx = doc.filename.endsWith('.docx');
                      const iconColor = isPdf ? 'text-red-500' : isDocx ? 'text-[#3730A3]' : 'text-gray-500';
                      
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="py-4 px-6">
                            <Link to={`/chat/${doc.id}`} className="flex items-center">
                              <FileText className={`w-4 h-4 mr-3 shrink-0 ${iconColor}`} />
                              <span className="text-sm font-medium text-gray-800 truncate max-w-[200px] group-hover:text-[#3730A3] transition-colors">{doc.filename}</span>
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">
                            {new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-500">
                            {fileSizeMB} MB
                          </td>
                          <td className="py-4 px-6">
                            {doc.status === 'INDEXED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-[#3730A3]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3730A3] mr-1.5" /> Indexed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                                Processing...
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                       <tr>
                         <td colSpan="4" className="py-12 text-center text-gray-500 text-sm">
                           No documents found. Upload one to get started!
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-50 text-center">
                <Link to="/library" className="text-xs font-bold text-[#3730A3] hover:underline">
                  View All Documents
                </Link>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
