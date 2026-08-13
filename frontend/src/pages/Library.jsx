import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, FileText, MoreVertical, Trash2, Loader2, UploadCloud, Grid, List, ChevronDown, Image as ImageIcon, File, Folder as FolderIcon, Filter } from 'lucide-react';
import { uploadDocument } from '../api';

export default function Library({ docs, fetchDocs, handleDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Documents');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
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
      return matchesSearch && (doc.filename.toLowerCase().endsWith('.txt') || doc.filename.toLowerCase().endsWith('.md') || doc.filename.toLowerCase().endsWith('.docx'));
    }
    
    return matchesSearch;
  });

  const getFileIcon = (filename) => {
    if (filename.toLowerCase().endsWith('.pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (filename.toLowerCase().endsWith('.png') || filename.toLowerCase().endsWith('.jpg')) return <ImageIcon className="w-6 h-6 text-purple-500" />;
    return <File className="w-6 h-6 text-blue-500" />;
  };

  const getBadgeColor = (filename) => {
    if (filename.toLowerCase().includes('financial')) return 'bg-blue-50 text-blue-600';
    if (filename.toLowerCase().includes('asset') || filename.toLowerCase().endsWith('.png')) return 'bg-purple-50 text-purple-600';
    return 'bg-slate-50 text-slate-600';
  };
  
  const getBadgeText = (filename) => {
    if (filename.toLowerCase().includes('financial')) return 'Finance';
    if (filename.toLowerCase().includes('asset') || filename.toLowerCase().endsWith('.png')) return 'Asset';
    return 'Planning';
  };

  return (
    <div className="h-full bg-transparent p-4 md:p-8 font-sans overflow-auto relative">
      
      {/* ==================== MOBILE VIEW ==================== */}
      <div className="md:hidden space-y-6">
        <div className="flex items-center justify-between py-2">
          <span className="text-xl font-bold text-gray-900">Library</span>
        </div>

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

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {['All Documents', 'PDFs', 'Images', 'Notes'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-[#3730A3] text-white shadow-md shadow-indigo-500/20' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isUploading && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-sm font-semibold text-gray-700">Uploading document...</span>
            </div>
            <span className="text-sm font-bold text-indigo-600">{uploadProgress}%</span>
          </div>
        )}

        <div className="space-y-3">
          {filteredDocs.map(doc => {
            const isMenuOpen = openMenuId === doc.id;
            const fileSizeMB = (doc.size / 1024 / 1024).toFixed(2);
            const dateStr = new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            return (
              <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-50 shadow-sm flex items-center justify-between relative group">
                <Link to={`/chat/${doc.id}`} className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50">
                    {getFileIcon(doc.filename)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate pr-4">{doc.filename}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{fileSizeMB} MB • Modified {dateStr}</p>
                  </div>
                </Link>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(isMenuOpen ? null : doc.id)} className="p-1 text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                      <button onClick={(e) => { setOpenMenuId(null); handleDelete(e, doc.id); }} className="w-full text-left px-4 py-2 text-xs text-red-600 flex items-center">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== DESKTOP VIEW ==================== */}
      <div className="hidden md:flex h-full gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-64 shrink-0 flex flex-col space-y-8">
          <button 
            onClick={triggerUpload}
            className="w-full bg-[#1c1a53] hover:bg-[#14123b] text-white py-3.5 rounded-xl font-bold flex items-center justify-center shadow-lg transition-colors"
          >
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload Files
          </button>

          <div>
            <h4 className="text-[10px] font-bold text-gray-400 label-caps mb-3 px-2">File Types</h4>
            <div className="space-y-1">
              {[
                { name: 'All Documents', count: docs.length, icon: Grid },
                { name: 'PDFs', count: docs.filter(d => d.filename.endsWith('.pdf')).length, icon: FileText },
                { name: 'Images', count: docs.filter(d => d.filename.match(/\.(png|jpg|jpeg)$/i)).length, icon: ImageIcon },
                { name: 'Notes', count: docs.filter(d => d.filename.match(/\.(txt|md|docx)$/i)).length, icon: File }
              ].map(filter => (
                <button
                  key={filter.name}
                  onClick={() => setActiveFilter(filter.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    activeFilter === filter.name 
                      ? 'bg-indigo-50/80 text-[#3730A3] font-bold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex items-center text-sm">
                    <filter.icon className={`w-4 h-4 mr-3 ${activeFilter === filter.name ? 'text-[#3730A3]' : 'text-gray-400'}`} />
                    {filter.name}
                  </div>
                  <span className={`text-xs ${activeFilter === filter.name ? 'text-[#3730A3]' : 'text-gray-400'}`}>{filter.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-3">
              <h4 className="text-[10px] font-bold text-gray-400 label-caps">Collections</h4>
              <Plus className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-700" />
            </div>
            <div className="space-y-1">
              {['Q4 Reports', 'Marketing Assets', 'Legal Drafts'].map(col => (
                <button key={col} className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-all">
                  <FolderIcon className="w-4 h-4 mr-3 text-gray-400" />
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-full border-2 border-[#3730A3] border-t-transparent animate-spin"></div>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Storage Status</h4>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 mt-4">
                <div className="bg-[#3730A3] h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs font-semibold text-gray-500">15GB of 20GB used</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif-heading font-bold text-gray-900">{activeFilter}</h2>
              <p className="text-gray-500 mt-1 text-sm">Manage and organize your structured intelligence.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2 text-gray-400" /> Date Modified
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-auto pb-8 pr-4 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start' : 'space-y-3'}`}>
            
            {filteredDocs.map(doc => {
              const isMenuOpen = openMenuId === doc.id;
              const fileSizeMB = (doc.size / 1024 / 1024).toFixed(1);
              const dateStr = new Date(doc.uploaded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              
              if (viewMode === 'grid') {
                return (
                  <div key={doc.id} className="bg-white rounded-3xl p-5 soft-shadow border border-gray-100 hover:border-indigo-200 transition-all group relative flex flex-col h-64 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        {getFileIcon(doc.filename)}
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setOpenMenuId(isMenuOpen ? null : doc.id); }} className="p-1 text-gray-300 hover:text-gray-600 rounded">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {isMenuOpen && (
                      <div className="absolute right-4 top-12 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1">
                        <button onClick={(e) => { e.preventDefault(); setOpenMenuId(null); handleDelete(e, doc.id); }} className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </button>
                      </div>
                    )}

                    <Link to={`/chat/${doc.id}`} className="flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">{doc.filename}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                        Initial document analysis and structured data extraction from the source file.
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getBadgeColor(doc.filename)}`}>
                          {getBadgeText(doc.filename)}
                        </span>
                        <div className="text-[10px] font-bold text-gray-400">
                          {fileSizeMB} MB • {dateStr}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              }

              // List View
              return (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 soft-shadow flex items-center justify-between hover:border-indigo-200 transition-all">
                  <Link to={`/chat/${doc.id}`} className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.filename)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate pr-4">{doc.filename}</p>
                      <p className="text-[11px] text-gray-500">Document • Added {dateStr}</p>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-8">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getBadgeColor(doc.filename)}`}>
                      {getBadgeText(doc.filename)}
                    </span>
                    <span className="text-sm font-bold text-gray-500 w-16 text-right">{fileSizeMB} MB</span>
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(isMenuOpen ? null : doc.id)} className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1">
                          <button onClick={(e) => { setOpenMenuId(null); handleDelete(e, doc.id); }} className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt" />

      {/* FAB */}
      <button onClick={triggerUpload} className="fixed bottom-20 right-6 w-12 h-12 bg-[#3730A3] hover:bg-[#312e81] text-white rounded-full flex items-center justify-center shadow-lg transition-all z-40 md:hidden">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
