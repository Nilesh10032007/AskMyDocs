import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, FileText, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { uploadDocument } from '../api';

export default function Library({ docs, fetchDocs, handleDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await uploadDocument(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      await fetchDocs();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Filter docs
  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'PDFs') {
      return matchesSearch && doc.filename.toLowerCase().endsWith('.pdf');
    }
    if (activeFilter === 'Images') {
      return matchesSearch && (doc.filename.toLowerCase().endsWith('.png') || doc.filename.toLowerCase().endsWith('.jpg') || doc.filename.toLowerCase().endsWith('.jpeg'));
    }
    if (activeFilter === 'Notes') {
      return matchesSearch && (doc.filename.toLowerCase().endsWith('.txt') || doc.filename.toLowerCase().endsWith('.md'));
    }
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-24 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">Library</span>
        </div>
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-[#3730A3] font-bold text-sm shrink-0">
          U
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 max-w-xl mx-auto space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search your documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'PDFs', 'Images', 'Notes'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-[#3730A3] text-white shadow-md shadow-indigo-500/20' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {filter === 'All' ? 'All Files' : filter}
            </button>
          ))}
        </div>

        {/* Upload Status Card */}
        {isUploading && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-sm font-semibold text-gray-700">Uploading document...</span>
            </div>
            <span className="text-sm font-bold text-indigo-600">{uploadProgress}%</span>
          </div>
        )}

        {/* Document List */}
        <div className="space-y-3">
          {filteredDocs.map(doc => {
            const isMenuOpen = openMenuId === doc.id;
            const fileSizeMB = (doc.size / 1024 / 1024).toFixed(2);
            const dateStr = new Date(doc.uploaded_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-50 shadow-sm flex items-center justify-between relative group hover:border-indigo-100 transition-colors">
                <Link to={`/chat/${doc.id}`} className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    doc.filename.endsWith('.pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate pr-4">{doc.filename}</p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {fileSizeMB} MB • Modified {dateStr}
                    </p>
                  </div>
                </Link>

                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(isMenuOpen ? null : doc.id)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                      <button
                        onClick={(e) => {
                          setOpenMenuId(null);
                          handleDelete(e, doc.id);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400 font-medium">No files found matching filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx,.txt"
      />

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={triggerUpload}
        className="fixed bottom-20 right-6 w-12 h-12 bg-[#3730A3] hover:bg-[#312e81] text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all z-40 md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
