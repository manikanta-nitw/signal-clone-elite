'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  status?: 'sending' | 'sent' | 'read';
}

export default function SignalClone() {
  // --- AUTH / ONBOARDING STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'phone' | 'profile'>('phone');

  // --- APP CHAT STATE ---
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Welcome to the technical evaluation.', sender: 'other', timestamp: '10:41 AM' },
    { id: '2', text: 'The UI is ready. Connecting the WebSocket backend next.', sender: 'me', timestamp: '10:42 AM', status: 'read' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeChat, setActiveChat] = useState<'Evaluator' | 'Elite YC Dev Group'>('Evaluator');
  
  // --- GROUP CREATION STATE ---
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      scrollToBottom();
    }
  }, [messages, isAuthenticated]);

  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    if (!isAuthenticated) return;

    ws.current = new WebSocket('ws://localhost:8000/ws/chat');

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const incomingText = event.data;
      setMessages((prev) => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          text: incomingText, 
          sender: 'other', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [isAuthenticated]);

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    ws.current.send(inputValue);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent' // Top 1% addition
      }
    ]);
    setInputValue(''); // Clear input after sending
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setActiveChat('Elite YC Dev Group');
    setMessages([
      { id: 'g1', text: `System: ${displayName} created group "${groupName}"`, sender: 'other', timestamp: 'Just now' }
    ]);
    setShowGroupModal(false);
  };

  // --- 1. LOGIN / ONBOARDING SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-[#121212] items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-blue-600/20 transform rotate-12">S</div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-4">Signal Messenger</h1>
            <p className="text-sm text-gray-400">Privacy that fits in your pocket</p>
          </div>

          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Verification Code (Mocked OTP)</label>
                <input 
                  type="text" 
                  placeholder="Enter any 6 digits" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-600"
                />
              </div>
              <button 
                onClick={() => phoneNumber && setStep('profile')}
                className="w-full bg-blue-600 text-white font-medium rounded-xl py-3 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/10"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase shadow-md">
                  {displayName ? displayName.slice(0, 2) : '?'}
                </div>
                <span className="text-xs text-blue-400 font-medium">Set Profile Avatar</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Display Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-600"
                />
              </div>
              <button 
                onClick={() => displayName && setIsAuthenticated(true)}
                className="w-full bg-blue-600 text-white font-medium rounded-xl py-3 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/10"
              >
                Finish Setup
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 2. MAIN APPLICATION INTERFACE ---
  return (
    <div className="flex h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm border-r border-gray-700 bg-gray-900/80 backdrop-blur-lg flex flex-col z-10 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              {displayName.slice(0,1).toUpperCase()}
            </div>
            <span className="font-semibold text-lg tracking-wide text-white">Chats</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Create Group Button */}
            <button 
              onClick={() => setShowGroupModal(true)} 
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors text-xs font-medium border border-gray-700 px-2.5"
            >
              + Group
            </button>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} title={isConnected ? "Connected" : "Disconnected"}></div>
          </div>
        </div>
        
        {/* Search */}
        <div className="p-3">
          <input type="text" placeholder="Search contacts or groups..." className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500" />
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-1">
          {/* DM Item */}
          <div 
            onClick={() => { setActiveChat('Evaluator'); }}
            className={`flex items-center gap-4 p-3 cursor-pointer transition-colors mx-2 rounded-lg ${activeChat === 'Evaluator' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-gray-300">E</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-gray-100 truncate">Evaluator (Live)</h3>
                <span className="text-xs text-gray-500">Now</span>
              </div>
              <p className="text-sm text-gray-400 truncate">Active session</p>
            </div>
          </div>

          {/* Group Chat Item */}
          {activeChat === 'Elite YC Dev Group' && (
            <div className="flex items-center gap-4 p-3 bg-gray-800 cursor-pointer mx-2 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-purple-600 flex-shrink-0 flex items-center justify-center font-bold text-white">G</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-100 truncate">Elite YC Dev Group</h3>
                  <span className="text-xs text-blue-400">Group</span>
                </div>
                <p className="text-sm text-gray-400 truncate">You joined this group.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Logged in info footer */}
        <div className="p-3 bg-gray-950/40 text-xs border-t border-gray-800 flex justify-between text-gray-500">
          <span>Logged in as: {displayName}</span>
          <button onClick={() => setIsAuthenticated(false)} className="hover:text-red-400 transition-colors">Logout</button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black relative">
        <div className="h-16 px-6 border-b border-gray-800 bg-gray-900/60 backdrop-blur-md flex items-center justify-between shadow-sm sticky top-0 z-10">
          <span className="font-semibold text-lg text-white">{activeChat}</span>
          <span className="text-xs text-gray-500">End-to-End Encrypted (Simulated)</span>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
           {messages.map((msg, idx) => (
             <div key={idx} className={`max-w-md shadow-md flex flex-col ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}>
               <div className={`p-3.5 ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-[#2b2b2b] text-gray-100 rounded-2xl rounded-tl-sm border border-gray-700/50'}`}>
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
               </div>
               
               {/* Timestamp and Delivery Status Row */}
               <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}>
                 <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                 
                 {/* Signal-style Checkmarks for 'me' messages */}
                 {msg.sender === 'me' && (
                   <span className="text-gray-500 flex">
                     {msg.status === 'sending' && <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                     {msg.status === 'sent' && <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                     {msg.status === 'read' && (
                       <div className="flex -space-x-1.5">
                         <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       </div>
                     )}
                   </span>
                 )}
               </div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800">
          <form onSubmit={sendMessage} className="flex gap-3 items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 shadow-inner">
            <button type="button" className="text-gray-400 hover:text-white transition-colors text-xl font-light">+</button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send an encrypted message..." 
              className="flex-1 bg-transparent focus:outline-none text-gray-100 placeholder-gray-500 text-[15px]"
            />
            <button type="submit" disabled={!inputValue.trim()} className="text-blue-500 font-semibold hover:text-blue-400 transition-colors disabled:opacity-50">Send</button>
          </form>
        </div>
      </div>

      {/* --- GROUP CREATION MODAL --- */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateGroup} className="w-full max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Group Conversation</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Group Name</label>
              <input 
                type="text" 
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Signal Dev Team" 
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowGroupModal(false)} className="text-sm text-gray-400 hover:text-white px-3 py-1.5">Cancel</button>
              <button type="submit" className="text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 py-1.5 font-medium">Create</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}