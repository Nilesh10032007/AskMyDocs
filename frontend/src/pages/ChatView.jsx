import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, MoreVertical, Paperclip, Send, BrainCircuit, Activity, BookOpen, ChevronLeft, ChevronDown, Search, X, Download, File } from 'lucide-react';
import { getChatHistory, queryDocument, getDocuments } from '../api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ChatView({ docs }) {
  const { docId } = useParams();
  const navigate = useNavigate();
  
  const activeDocId = docId || (docs && docs[0]?.id);
  const docIdsArray = activeDocId ? activeDocId.split(',') : [];

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docsList, setDocsList] = useState([]);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeDocId) {
      loadDocAndHistory();
    }
  }, [activeDocId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadDocAndHistory = async () => {
    try {
      const allDocs = docs || await getDocuments();
      const currentDocs = allDocs.filter(d => docIdsArray.includes(d.id));
      setDocsList(currentDocs);

      const history = await getChatHistory(activeDocId);
      const formattedHistory = [];
      history.forEach(h => {
        formattedHistory.push({ role: 'user', content: h.question });
        formattedHistory.push({ role: 'ai', content: h.answer, sources: h.sources });
      });
      setMessages(formattedHistory);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeDocId) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await queryDocument(docIdsArray, userMsg);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.answer, 
        sources: response.sources 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, there was an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnswer = (text) => {
    return text.split(/(\*\*.*?\*\*|\d+(\.\d+)?%|\$\d+[M|B|K]?)/g).map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</span>;
      }
      if (/\d+(\.\d+)?%|\$\d+[M|B|K]?/.test(part)) {
        return <span key={i} className="bg-[#E0E7FF] text-[#3730A3] px-1 rounded font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!activeDocId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <BrainCircuit className="w-16 h-16 text-indigo-200 mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-2">No Active Document</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Please select or upload a document in the library to start chatting.</p>
        <Link to="/library" className="bg-[#3730A3] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#312e81]">
          Go to Library
        </Link>
      </div>
    );
  }

  const activeDocName = docsList[0]?.filename || 'Loading document...';
  const fileSizeMB = docsList[0] ? (docsList[0].size / 1024 / 1024).toFixed(1) : 0;
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Alex' };
  const userFirstName = user.name ? user.name.split(' ')[0] : 'Alex';

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden relative font-sans">
      
      {/* ==================== MOBILE HEADER ==================== */}
      <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex flex-col shrink-0 space-y-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 text-gray-600 hover:text-black">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold text-gray-900">Search</span>
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-[#3730A3] font-bold text-xs">
            {userFirstName[0]}
          </div>
        </div>
        <div className="bg-[#f4f7fb] px-4 py-2.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[11px] font-bold">
            <span className="text-gray-400">Querying Context:</span>
            <span className="text-gray-700 truncate max-w-[180px]">{activeDocName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>
      </div>

      {/* ==================== DESKTOP 3-COLUMN LAYOUT ==================== */}
      
      {/* Column 1: Recent Activity Sidebar */}
      <div className="hidden md:flex w-72 lg:w-80 border-r border-gray-100 bg-white flex-col shrink-0 p-6 z-10 relative">
        <h3 className="font-serif-heading font-bold text-xl text-gray-900 mb-6 tracking-tight">Recent Activity</h3>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filter chats..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
          />
        </div>
        
        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-none flex-1">
          {/* Active Chat Item */}
          <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-100 cursor-pointer">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-[#3730A3] text-white rounded-lg flex items-center justify-center shrink-0 mr-3 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm leading-tight">Q3 Financial Analysis</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">Summarize the revenue impact of...</p>
                <p className="text-[10px] font-bold text-gray-400 mt-2">2h ago</p>
              </div>
            </div>
          </div>
          
          {/* Other Mock Chat Items */}
          {[
            { title: 'HR Onboarding Docs', excerpt: 'What is the policy for remote...', time: 'Yesterday', icon: <File className="w-4 h-4 text-gray-500" /> },
            { title: 'Project Phoenix Specs', excerpt: 'Can you find the API rate limits...', time: 'Oct 12', icon: <FileText className="w-4 h-4 text-gray-500" /> }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-transparent hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mr-3 mt-0.5 group-hover:bg-gray-200 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 text-sm leading-tight">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.excerpt}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Main Chat Thread */}
      <div className="flex-1 flex flex-col bg-white md:bg-gray-50/30 relative overflow-hidden min-w-0 pb-16 md:pb-0 z-0">
        
        {/* Chat Top Context Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-center py-4 border-b border-gray-100 shrink-0 bg-white">
          <span className="text-[10px] font-bold text-gray-400 label-caps mr-4 shrink-0">QUERYING CONTEXT:</span>
          <div className="bg-indigo-50/50 border border-indigo-100 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium text-[#3730A3] max-w-sm">
            <FileText className="w-4 h-4 mr-2 text-indigo-400 shrink-0" />
            <span className="truncate mr-3 font-bold">{activeDocName}</span>
            <button className="text-indigo-300 hover:text-indigo-600 shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
          
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-50 text-[#3730A3] px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100">
              Context initialized. Ready for questions.
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col mb-8">
              {msg.role === 'user' ? (
                <div className="flex justify-end space-x-3 mb-2">
                  <div className="flex-1" />
                  <div className="text-sm text-gray-800 font-medium max-w-[85%] lg:max-w-[75%]">
                    <div className="flex items-center justify-end mb-2 space-x-2 pr-1">
                      <span className="text-xs font-bold text-gray-900">{user.name || 'Alex Miller'}</span>
                      <span className="text-[10px] font-bold text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="text-right leading-relaxed text-gray-700">
                      {msg.content}
                    </div>
                  </div>
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full shrink-0 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-[#3730A3] font-bold text-sm shrink-0 border-2 border-white shadow-sm">
                      {userFirstName[0]}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-start space-x-3 mt-4">
                  <div className="w-10 h-10 bg-[#3730A3] rounded-full flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 border-2 border-white z-10">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-800 font-medium max-w-[85%] lg:max-w-[75%] bg-white rounded-2xl rounded-tl-sm p-6 shadow-sm border border-gray-100 relative -ml-4 pl-8">
                    <div className="flex items-center mb-4 space-x-2">
                      <span className="text-xs font-bold text-[#3730A3]">Ask My Docs AI</span>
                      <span className="text-[10px] font-bold text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="leading-relaxed text-gray-700 space-y-4">
                      {formatAnswer(msg.content)}
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-6 pt-4 text-xs text-indigo-600 border-t border-gray-50 flex flex-wrap gap-2">
                        {msg.sources.map((src, i) => {
                          const isString = typeof src === 'string'; 
                          const label = isString ? src : `Reference: Page ${src.page}, Section 3.2`;
                          return (
                            <span 
                              key={i} 
                              onClick={() => {
                                if (!isString && src.doc_id) {
                                  const ext = src.filename?.split('.').pop().toLowerCase();
                                  if (ext === 'pdf') {
                                    setActivePdfUrl(`https://askmydocs-38au.onrender.com/api/uploads/${src.doc_id}.${ext}`);
                                    setActivePage(src.page);
                                  }
                                }
                              }}
                              className="inline-flex items-center font-bold hover:underline cursor-pointer text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors hover:bg-indigo-100"
                            >
                              <BookOpen className="w-3.5 h-3.5 mr-2 opacity-70" /> {label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start space-x-3 mt-4">
               <div className="w-10 h-10 bg-[#3730A3] rounded-full flex items-center justify-center text-white shrink-0 shadow-md border-2 border-white z-10">
                 <BrainCircuit className="w-5 h-5" />
               </div>
               <div className="bg-white rounded-2xl rounded-tl-sm p-5 shadow-sm border border-gray-100 flex items-center space-x-2 relative -ml-4 pl-8">
                 <div className="w-1.5 h-1.5 bg-[#3730A3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-[#3730A3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-[#3730A3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-4 md:px-8 lg:px-12 pb-4 md:pb-8 pt-4 bg-gradient-to-t from-white via-white/80 to-transparent">
          <form onSubmit={handleSend} className="relative w-full flex items-center shadow-lg shadow-indigo-500/5 bg-white rounded-2xl p-1.5 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <div className="pl-4 py-2 w-full flex items-center">
              <span className="text-gray-400 mr-2 font-medium text-sm whitespace-nowrap">Ask a question about your documents</span>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=""
              className="absolute inset-0 w-full h-full opacity-0 cursor-text pl-[220px] outline-none"
              style={{ opacity: input ? 1 : 0, background: input ? 'white' : 'transparent', borderRadius: '1rem' }}
              disabled={isLoading}
            />
            {/* Actual Input for typing that covers the placeholder text when not empty */}
            {input && (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="absolute inset-y-0 left-0 w-full pl-4 pr-24 outline-none bg-white rounded-2xl text-sm font-medium text-gray-900"
                disabled={isLoading}
                autoFocus
              />
            )}
            
            <div className="flex items-center pr-1 space-x-1 absolute right-1.5 top-1/2 -translate-y-1/2 z-10 bg-white pl-2">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-lg mr-1">
                <Paperclip className="w-4 h-4" />
              </button>
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="p-2 bg-[#1c1a53] text-white rounded-lg hover:bg-[#14123b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-400 font-bold">AI can make mistakes. Verify important information from the source documents.</span>
          </div>
        </div>
      </div>

      {/* Column 3: Source Document Sidebar */}
      <div className="hidden lg:flex w-[320px] xl:w-[360px] bg-white border-l border-gray-100 flex-col shrink-0 overflow-y-auto relative z-10 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.05)]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
           <h3 className="font-bold text-gray-900 flex items-center">
             <Download className="w-4 h-4 mr-2 text-gray-400" /> Source Document
           </h3>
           <button className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Document Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start space-x-4">
             <div className="w-12 h-14 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0 border border-red-100 shadow-sm">
               <FileText className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{activeDocName}</h4>
               <p className="text-[10px] font-bold text-gray-400 mb-2">{fileSizeMB} MB • 24 Pages</p>
               <div className="flex gap-1 flex-wrap">
                 <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">Finance</span>
                 <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">2023</span>
                 <span className="px-2 py-0.5 bg-indigo-50 text-[#3730A3] rounded text-[9px] font-bold">Confidential</span>
               </div>
             </div>
          </div>

          {/* Highlighted Excerpt */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 label-caps mb-3">Relevant Excerpt (Page 14)</h4>
            <div className="bg-[#fffdf2] p-5 rounded-2xl border border-[#fef3c7] shadow-sm relative">
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                "...driving overall growth. <span className="bg-[#fef08a] px-1 py-0.5 rounded font-bold text-gray-900">The primary driver for the revenue increase in the APAC region was the successful launch of the new enterprise software suite in Japan and South Korea.</span> Early adoption rates exceeded internal projections by 15%, resulting in a <span className="bg-[#fef08a] px-1 py-0.5 rounded font-bold text-gray-900">34% year-over-year growth in enterprise licensing</span> in these markets..."
              </p>
            </div>
          </div>

          {/* Page Preview */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 label-caps mb-3">Page Preview</h4>
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3 shadow-inner aspect-[3/4] flex items-center justify-center">
              {activePdfUrl ? (
                <Document file={activePdfUrl} className="max-w-full drop-shadow-md border border-gray-200">
                  <Page pageNumber={activePage} width={260} renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>
              ) : (
                <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col p-4 relative overflow-hidden">
                  <div className="w-3/4 h-2 bg-gray-200 rounded mb-4"></div>
                  <div className="w-1/2 h-2 bg-gray-200 rounded mb-6"></div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="h-16 bg-blue-50/50 border border-blue-100/50 rounded flex flex-col p-2 space-y-1">
                        <div className="w-1/2 h-1 bg-blue-200 rounded"></div>
                        <div className="w-full h-8 bg-blue-100/50 rounded mt-1"></div>
                     </div>
                     <div className="h-16 bg-blue-50/50 border border-blue-100/50 rounded flex flex-col p-2 space-y-1">
                        <div className="w-1/2 h-1 bg-blue-200 rounded"></div>
                        <div className="w-full h-8 bg-blue-100/50 rounded mt-1"></div>
                     </div>
                  </div>
                  
                  <div className="space-y-2.5 mt-auto">
                    <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-5/6 h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-4/5 h-2 bg-amber-200 rounded"></div>
                    <div className="w-2/3 h-2 bg-amber-200 rounded"></div>
                  </div>
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] pointer-events-none"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
