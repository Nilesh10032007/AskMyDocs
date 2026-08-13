import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FileText, MoreVertical, Paperclip, Send, BrainCircuit, Activity, Lock, BookOpen, Table, ChevronLeft, ChevronDown } from 'lucide-react';
import { getChatHistory, queryDocument, getDocuments } from '../api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ChatView({ docs }) {
  const { docId } = useParams();
  const navigate = useNavigate();
  
  // Handle case where docId is undefined
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
        return <span key={i} className="bg-[#E0E7FF] text-[#3730A3] px-1 rounded">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!activeDocId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f4f7fb] p-6 text-center">
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

  return (
    <div className="flex h-full pb-16 md:pb-0">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] relative">
        
        {/* ==================== MOBILE HEADER (Figma Style) ==================== */}
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex flex-col sticky top-0 z-30 space-y-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-1 text-gray-600 hover:text-black">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-base font-bold text-gray-900">Search</span>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-[#3730A3] font-bold text-xs">
              U
            </div>
          </div>
          
          {/* Active Context Selection Dropdown */}
          <div className="bg-[#f4f7fb] px-4 py-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-1 text-[11px] font-bold">
              <span className="text-gray-400">Querying Context:</span>
              <span className="text-gray-700 truncate max-w-[180px]">{activeDocName}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </div>
        </div>

        {/* Desktop Navbar (Shared style) */}
        <div className="hidden md:flex h-20 items-center justify-between px-8 shrink-0">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-[#3730A3] text-white p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">DocuMind AI</span>
          </Link>
          <div className="w-10 h-10 bg-[#3730A3] rounded-full flex items-center justify-center text-white shrink-0">
            U
          </div>
        </div>

        {/* Desktop Chat Header */}
        <div className="hidden md:flex h-16 bg-white border-b border-t border-gray-100 items-center justify-between px-8 shrink-0 mx-4 rounded-t-xl soft-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {docIdsArray.length > 1 ? `Multiple Documents (${docIdsArray.length})` : activeDocName}
              </h2>
            </div>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 md:space-y-8 md:mx-4 bg-white/50 rounded-b-xl border-x border-b border-gray-100">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BrainCircuit className="w-12 h-12 md:w-16 md:h-16 text-indigo-100 mb-4" />
              <p className="text-sm md:text-lg font-semibold text-gray-500">How can I help you analyze this document?</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] ${
                msg.role === 'user' 
                  ? 'bg-[#3730A3] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm text-sm' 
                  : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm p-5 shadow-sm border border-gray-50 text-sm'
              }`}>
                <div className="leading-relaxed">
                  {msg.role === 'user' ? msg.content : formatAnswer(msg.content)}
                </div>
                
                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">VERIFIED SOURCES</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => {
                        const isString = typeof src === 'string'; 
                        const label = isString ? src : `${src.filename} (Page ${src.page})`;
                        return (
                          <span 
                            key={i} 
                            onClick={() => {
                              if (!isString && src.doc_id) {
                                const ext = src.filename.split('.').pop().toLowerCase();
                                if (ext === 'pdf') {
                                  setActivePdfUrl(`https://askmydocs-38au.onrender.com/api/uploads/${src.doc_id}.${ext}`);
                                  setActivePage(src.page);
                                }
                              }
                            }}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[#3730A3] text-xs font-semibold hover:bg-indigo-50 transition-colors border border-gray-100 cursor-pointer bg-white"
                          >
                            <BookOpen className="w-3 h-3 mr-1" /> {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-50 flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-4 md:px-8 pb-4 md:pb-8 pt-2">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center shadow-sm bg-white rounded-2xl p-1.5 border border-gray-100">
            <button type="button" className="ml-1 text-gray-400 hover:text-gray-600 transition-colors p-2">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this document..."
              className="w-full border-none py-2 px-3 focus:ring-0 text-sm outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="mr-0.5 p-2.5 bg-[#3730A3] text-white rounded-xl hover:bg-[#312e81] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar: PDF Viewer (Desktop Only) */}
      <div className="hidden lg:flex w-[400px] bg-[#f4f7fb] border-l border-gray-100 flex-col shrink-0 overflow-y-auto">
        {activePdfUrl ? (
          <div className="flex flex-col h-full bg-[#1e293b] p-4 relative overflow-y-auto shadow-inner">
             <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#1e293b] z-10 py-2 border-b border-gray-700">
               <span className="text-white text-xs font-bold flex items-center">
                 <FileText className="w-4 h-4 mr-2 text-indigo-400" /> DOCUMENT VIEWER
               </span>
               <button onClick={() => setActivePdfUrl(null)} className="text-gray-400 hover:text-white text-xs font-bold px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors">
                 CLOSE
               </button>
             </div>
             <div className="flex-1 flex justify-center w-full pb-8">
               <Document file={activePdfUrl} className="max-w-full drop-shadow-xl">
                 <Page pageNumber={activePage} width={360} renderTextLayer={true} renderAnnotationLayer={true} />
               </Document>
             </div>
          </div>
        ) : (
          <div className="p-8 space-y-8">
            <div>
              <h3 className="font-bold text-gray-400 mb-4 tracking-widest text-xs">DOCUMENT INSIGHTS</h3>
              <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Complexity Score</span>
                  <span className="bg-[#E0E7FF] text-[#3730A3] text-xs font-bold px-2 py-1 rounded">High</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div className="bg-[#3730A3] h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  This document contains dense financial data and multi-region comparisons.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
