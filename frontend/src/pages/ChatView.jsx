import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, MoreVertical, Paperclip, Send, BrainCircuit, Activity, Lock, BookOpen, Table, CheckCircle2, Search, User } from 'lucide-react';
import { getChatHistory, queryDocument, getDocuments } from '../api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ChatView() {
  const { docId } = useParams();
  const docIdsArray = docId.split(',');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docsList, setDocsList] = useState([]);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadDocAndHistory();
  }, [docId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadDocAndHistory = async () => {
    try {
      const allDocs = await getDocuments();
      const currentDocs = allDocs.filter(d => docIdsArray.includes(d.id));
      setDocsList(currentDocs);

      const history = await getChatHistory(docId);
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
    if (!input.trim() || isLoading) return;

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

  // Basic markdown-like highlighting for key phrases (simulated by matching numbers or bold syntax)
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

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f4f7fb] relative">
        
        {/* Top Navbar (Shared style) */}
        <div className="h-20 flex items-center justify-between px-4 md:px-8 shrink-0 mt-12 md:mt-0">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-[#3730A3] text-white p-1.5 md:p-2 rounded-lg">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">DocuMind AI</span>
          </Link>
          
          <div className="flex-1 max-w-md mx-2 md:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search docs..." 
                className="w-full pl-10 pr-4 py-2 bg-[#EBF1FF] border-none rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs md:text-sm"
              />
            </div>
          </div>

          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#3730A3] rounded-full flex items-center justify-center text-white shrink-0">
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        </div>

        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-t border-gray-100 flex items-center justify-between px-8 shrink-0 mx-4 rounded-t-xl soft-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {docIdsArray.length > 1 ? `Multiple Documents (${docIdsArray.length})` : (docsList[0]?.filename || 'Loading...')}
              </h2>
              {docsList.some(d => d.status === 'FAILED') ? (
                <div className="flex items-center text-[10px] font-bold text-red-600 mt-0.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" /> INDEXING FAILED
                </div>
              ) : docsList.length > 0 && docsList.every(d => d.status === 'INDEXED') ? (
                <div className="flex items-center text-[10px] font-bold text-green-600 mt-0.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" /> INDEXED & READY
                </div>
              ) : (
                <div className="flex items-center text-[10px] font-bold text-blue-600 mt-0.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" /> PROCESSING...
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center transition-colors">
              <FileText className="w-3.5 h-3.5 mr-2" /> Add Context
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 mx-4 bg-white/50 mb-4 rounded-b-xl border-x border-b border-gray-100">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BrainCircuit className="w-16 h-16 text-indigo-100 mb-4" />
              <p className="text-lg font-medium text-gray-500">How can I help you analyze this document?</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#3730A3] text-white flex items-center justify-center mr-4 shrink-0 shadow-sm mt-1">
                  <BrainCircuit className="w-5 h-5" />
                </div>
              )}
              
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-[#D8E2F9] text-gray-900 rounded-2xl rounded-tr-sm px-6 py-4 shadow-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm p-6 soft-shadow border border-gray-50'}`}>
                <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'font-medium' : 'text-gray-700'}`}>
                  {msg.role === 'user' ? msg.content : formatAnswer(msg.content)}
                </div>
                
                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="label-caps text-[10px] font-bold text-gray-400 mb-2 tracking-wider">VERIFIED SOURCES</p>
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
                                  setActivePdfUrl(`http://127.0.0.1:8000/api/uploads/${src.doc_id}.${ext}`);
                                  setActivePage(src.page);
                                }
                              }
                            }}
                            className="inline-flex items-center px-2.5 py-1 rounded text-[#3730A3] text-xs font-semibold hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 cursor-pointer shadow-sm bg-white"
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> {label}
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
              <div className="w-8 h-8 rounded-full bg-[#3730A3] text-white flex items-center justify-center mr-4 shrink-0 shadow-sm">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-6 soft-shadow border border-gray-50 flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-8 pb-8 pt-4">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center soft-shadow bg-white rounded-2xl p-2 border border-gray-100">
            <button type="button" className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-2">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={docIdsArray.length > 1 ? "Ask anything about selected documents..." : `Ask anything about ${docsList[0]?.filename || 'this document'}...`}
              className="w-full border-none py-3 px-4 focus:ring-0 text-sm outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="mr-1 p-3 bg-[#3730A3] text-white rounded-xl hover:bg-[#312e81] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex justify-center items-center space-x-6 mt-4 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center"><Activity className="w-3 h-3 mr-1 text-gray-400" /> Powered by GPT-4o</span>
            <span className="flex items-center"><Lock className="w-3 h-3 mr-1 text-gray-400" /> Data is encrypted & private</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Document Insights / PDF Viewer */}
      <div className="hidden lg:flex w-[400px] bg-[#f4f7fb] border-l border-gray-100 flex-col shrink-0 overflow-y-auto">
        {activePdfUrl ? (
          <div className="flex flex-col h-full bg-[#1e293b] p-4 relative overflow-y-auto shadow-inner">
             <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#1e293b] z-10 py-2 border-b border-gray-700">
               <span className="text-white text-xs font-bold label-caps flex items-center">
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
              <h3 className="label-caps font-bold text-gray-400 mb-4 tracking-widest text-xs">DOCUMENT INSIGHTS</h3>
              <div className="bg-white soft-shadow rounded-xl p-5 border border-gray-50">
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

            <div>
              <h3 className="label-caps font-bold text-gray-400 mb-4 tracking-widest text-xs">QUICK ACTIONS</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center p-3 rounded-lg hover:bg-white text-left transition-colors border border-transparent hover:border-gray-100 group shadow-sm">
                  <FileText className="w-4 h-4 text-[#3730A3] mr-3 shrink-0" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-[#3730A3]">Generate Executive Summary</span>
                </button>
                <button className="w-full flex items-center p-3 rounded-lg hover:bg-white text-left transition-colors border border-transparent hover:border-gray-100 group shadow-sm">
                  <Table className="w-4 h-4 text-[#3730A3] mr-3 shrink-0" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-[#3730A3]">Extract All Tables to CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
