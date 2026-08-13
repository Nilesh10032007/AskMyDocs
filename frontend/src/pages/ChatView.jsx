import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, MoreVertical, Paperclip, Send, BrainCircuit, Activity, BookOpen, ChevronLeft, ChevronDown, Search, X, Download, File } from 'lucide-react';
import { getChatHistory, getChats, queryDocument, getDocuments } from '../api';
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
  const [chatSessions, setChatSessions] = useState([]);
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

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      const sessions = await getChats();
      setChatSessions(sessions);
    } catch (err) {
      console.error(err);
    }
  };

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
        return <span key={i} className="bg-indigo-500/20 text-indigo-400 px-1 rounded font-bold border border-indigo-500/20">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!activeDocId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#0B0E14]">
        <BrainCircuit className="w-16 h-16 text-indigo-500/30 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Document</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">Please select or upload a document in the library to start chatting.</p>
        <Link to="/library" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors">
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
      <div className="md:hidden bg-[#151821] border-b border-white/5 px-4 py-3 flex flex-col shrink-0 space-y-3 z-30">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 text-gray-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-base font-bold text-white">Search</span>
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xs">
            {userFirstName[0]}
          </div>
        </div>
        <div className="bg-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[11px] font-bold">
            <span className="text-gray-400">Querying Context:</span>
            <span className="text-gray-200 truncate max-w-[180px]">{activeDocName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </div>
      </div>

      {/* ==================== DESKTOP 3-COLUMN LAYOUT ==================== */}
      
      {/* Column 1: Recent Activity Sidebar */}
      <div className="hidden md:flex w-72 lg:w-80 border-r border-white/5 bg-[#151821] flex-col shrink-0 p-6 z-10 relative">
        <h3 className="font-serif-heading font-bold text-xl text-white mb-6 tracking-tight">Recent Activity</h3>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Filter chats..." 
            className="w-full pl-9 pr-4 py-2 bg-[#0B0E14] border border-white/5 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium text-gray-200 placeholder-gray-500"
          />
        </div>
        
        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-none flex-1">
          {chatSessions.length > 0 ? chatSessions.map((session, i) => {
             const isActive = activeDocId === session.doc_ids;
             const timeStr = new Date(session.timestamp).toLocaleDateString();
             return (
               <div key={i} onClick={() => navigate(`/chat/${session.doc_ids}`)} className={`p-4 rounded-xl border cursor-pointer transition-colors group ${isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-transparent hover:bg-white/5'}`}>
                 <div className="flex items-start">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-3 mt-0.5 ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 group-hover:bg-white/10 text-gray-500'}`}>
                     <FileText className="w-4 h-4" />
                   </div>
                   <div className="min-w-0">
                     <h4 className={`font-bold text-sm leading-tight truncate ${isActive ? 'text-white' : 'text-gray-400'}`}>Session</h4>
                     <p className="text-xs text-gray-500 mt-1 line-clamp-1">{session.last_message}</p>
                     <p className="text-[10px] font-bold text-gray-500 mt-2">{timeStr}</p>
                   </div>
                 </div>
               </div>
             );
          }) : (
             <div className="text-sm text-gray-500 text-center mt-4">No recent chats</div>
          )}
        </div>
      </div>

      {/* Column 2: Main Chat Thread */}
      <div className="flex-1 flex flex-col bg-[#0B0E14] relative overflow-hidden min-w-0 pb-16 md:pb-0 z-0">
        
        {/* Chat Top Context Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-center py-4 border-b border-white/5 shrink-0 bg-[#151821]">
          <span className="text-[10px] font-bold text-gray-400 label-caps mr-4 shrink-0">QUERYING CONTEXT:</span>
          <div className="bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium text-indigo-300 max-w-sm">
            <FileText className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
            <span className="truncate mr-3 font-bold">{activeDocName}</span>
            <button className="text-indigo-400 hover:text-indigo-200 shrink-0"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
          
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-500/30">
              Context initialized. Ready for questions.
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col mb-8">
              {msg.role === 'user' ? (
                <div className="flex justify-end space-x-3 mb-2">
                  <div className="flex-1" />
                  <div className="text-sm text-gray-200 font-medium max-w-[85%] lg:max-w-[75%]">
                    <div className="flex items-center justify-end mb-2 space-x-2 pr-1">
                      <span className="text-xs font-bold text-white">{user.name || 'Alex Miller'}</span>
                      <span className="text-[10px] font-bold text-gray-500">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="text-right leading-relaxed text-gray-300">
                      {msg.content}
                    </div>
                  </div>
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full shrink-0 object-cover border-2 border-[#151821]" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0 border-2 border-[#151821] shadow-sm">
                      {userFirstName[0]}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-start space-x-3 mt-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30 border-2 border-[#151821] z-10">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-200 font-medium max-w-[85%] lg:max-w-[75%] bg-[#151821] rounded-2xl rounded-tl-sm p-6 shadow-lg shadow-black/20 border border-white/5 relative -ml-4 pl-8">
                    <div className="flex items-center mb-4 space-x-2">
                      <span className="text-xs font-bold text-indigo-400">Ask My Docs AI</span>
                      <span className="text-[10px] font-bold text-gray-500">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="leading-relaxed text-gray-300 space-y-4">
                      {formatAnswer(msg.content)}
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-6 pt-4 text-xs text-indigo-400 border-t border-white/5 flex flex-wrap gap-2">
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
                              className="inline-flex items-center font-bold hover:underline cursor-pointer text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
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
               <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md border-2 border-[#151821] z-10">
                 <BrainCircuit className="w-5 h-5" />
               </div>
               <div className="bg-[#151821] rounded-2xl rounded-tl-sm p-5 shadow-lg shadow-black/20 border border-white/5 flex items-center space-x-2 relative -ml-4 pl-8">
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-4 md:px-8 lg:px-12 pb-4 md:pb-8 pt-4 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/90 to-transparent">
          <form onSubmit={handleSend} className="relative w-full flex items-center shadow-lg shadow-black/50 bg-[#151821] rounded-2xl p-1.5 border border-white/10 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="pl-4 py-2 w-full flex items-center">
              <span className="text-gray-500 mr-2 font-medium text-sm whitespace-nowrap">Ask a question about your documents</span>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=""
              className="absolute inset-0 w-full h-full opacity-0 cursor-text pl-[220px] outline-none"
              style={{ opacity: input ? 1 : 0, background: input ? '#151821' : 'transparent', borderRadius: '1rem' }}
              disabled={isLoading}
            />
            {/* Actual Input for typing that covers the placeholder text when not empty */}
            {input && (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="absolute inset-y-0 left-0 w-full pl-4 pr-24 outline-none bg-[#151821] rounded-2xl text-sm font-medium text-white"
                disabled={isLoading}
                autoFocus
              />
            )}
            
            <div className="flex items-center pr-1 space-x-1 absolute right-1.5 top-1/2 -translate-y-1/2 z-10 bg-[#151821] pl-2 rounded-r-2xl">
              <button type="button" className="p-2 text-gray-500 hover:text-gray-300 transition-colors border border-white/10 rounded-lg mr-1">
                <Paperclip className="w-4 h-4" />
              </button>
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center"
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
      <div className="hidden lg:flex w-[320px] xl:w-[360px] bg-[#151821] border-l border-white/5 flex-col shrink-0 overflow-y-auto relative z-10 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#151821]/90 backdrop-blur-sm z-10">
           <h3 className="font-bold text-white flex items-center">
             <Download className="w-4 h-4 mr-2 text-gray-400" /> Source Document
           </h3>
           <button className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Document Card */}
          <div className="bg-[#1a1d27] rounded-2xl p-4 border border-white/5 shadow-md flex items-start space-x-4">
             <div className="w-12 h-14 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 shrink-0 border border-red-500/20 shadow-sm">
               <FileText className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-bold text-white text-sm leading-tight mb-1">{activeDocName}</h4>
               <p className="text-[10px] font-bold text-gray-400 mb-2">{fileSizeMB} MB • 24 Pages</p>
               <div className="flex gap-1 flex-wrap">
                 <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-[9px] font-bold">Finance</span>
                 <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-[9px] font-bold">2023</span>
                 <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-bold">Confidential</span>
               </div>
             </div>
          </div>

          {/* Page Preview */}
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 label-caps mb-3">Page Preview</h4>
            <div className="bg-[#0B0E14] rounded-2xl border border-white/5 p-3 shadow-inner aspect-[3/4] flex items-center justify-center">
              {activePdfUrl ? (
                <Document file={activePdfUrl} className="max-w-full drop-shadow-lg border border-white/10">
                  <Page pageNumber={activePage} width={260} renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>
              ) : (
                <div className="w-full h-full bg-[#1a1d27] rounded-lg border border-white/10 shadow-md flex flex-col p-4 relative overflow-hidden">
                  <div className="w-3/4 h-2 bg-white/10 rounded mb-4"></div>
                  <div className="w-1/2 h-2 bg-white/10 rounded mb-6"></div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="h-16 bg-blue-500/10 border border-blue-500/20 rounded flex flex-col p-2 space-y-1">
                        <div className="w-1/2 h-1 bg-blue-500/30 rounded"></div>
                        <div className="w-full h-8 bg-blue-500/20 rounded mt-1"></div>
                     </div>
                     <div className="h-16 bg-blue-500/10 border border-blue-500/20 rounded flex flex-col p-2 space-y-1">
                        <div className="w-1/2 h-1 bg-blue-500/30 rounded"></div>
                        <div className="w-full h-8 bg-blue-500/20 rounded mt-1"></div>
                     </div>
                  </div>
                  
                  <div className="space-y-2.5 mt-auto">
                    <div className="w-full h-1.5 bg-white/5 rounded"></div>
                    <div className="w-5/6 h-1.5 bg-white/5 rounded"></div>
                    <div className="w-full h-1.5 bg-white/5 rounded"></div>
                    <div className="w-4/5 h-2 bg-amber-500/30 rounded"></div>
                    <div className="w-2/3 h-2 bg-amber-500/30 rounded"></div>
                  </div>
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
