import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Mail, Trash2, CheckCircle2, Clock, Send, Eye, MessageSquare, Terminal, X, RefreshCw } from 'lucide-react';
import { db, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { CMS_DOCS, uploadCmsAsset } from '../lib/cms';
import { Paperclip, FileText as FileIcon } from 'lucide-react';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for managing inline replies
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]); // [{ name: '', url: '' }]
  const [uploadingFile, setUploadingFile] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState({ type: '', text: '' }); // type: 'success' | 'error'

  useEffect(() => {
    const q = query(collection(db, CMS_DOCS.messages), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (id, currentReadStatus) => {
    try {
      await updateDoc(doc(db, CMS_DOCS.messages, id), { read: !currentReadStatus });
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, CMS_DOCS.messages, id));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const startInlineReply = (msg) => {
    setActiveReplyId(msg.id);
    setReplySubject(`Re: Inquiry from ${msg.name} - Sahan Pramuditha Portfolio`);
    setReplyMessage(`Hi ${msg.name},\n\nThank you for reaching out! Regarding your inquiry about "${msg.projectType || 'Project'}" with a budget of "${msg.budget || 'Not Specified'}"...\n\n`);
    setReplyAttachments([]);
    setStatusFeedback({ type: '', text: '' });
  };

  const cancelInlineReply = () => {
    setActiveReplyId(null);
    setReplyMessage('');
    setReplySubject('');
    setReplyAttachments([]);
    setStatusFeedback({ type: '', text: '' });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setStatusFeedback({ type: '', text: '' });

    try {
      // Upload via existing CMS asset handler directly to Firebase Storage
      const url = await uploadCmsAsset(file, 'uploads/replies');
      setReplyAttachments((prev) => [...prev, { name: file.name, url }]);
      setStatusFeedback({ type: 'success', text: `Attached ${file.name} successfully.` });
    } catch (err) {
      console.error('Failed to attach document:', err);
      setStatusFeedback({ type: 'error', text: `Upload failed: ${err.message || 'Unknown error'}` });
    } finally {
      setUploadingFile(false);
      event.target.value = ''; // clear input
    }
  };

  const removeAttachment = (idxToRemove) => {
    setReplyAttachments((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const sendInlineReply = async (msg) => {
    if (!replyMessage.trim()) {
      setStatusFeedback({ type: 'error', text: 'Reply content cannot be empty.' });
      return;
    }
    setSendingReply(true);
    setStatusFeedback({ type: '', text: '' });
    
    try {
      const sendReplyCallable = httpsCallable(functions, 'sendReply');
      await sendReplyCallable({
        to: msg.email,
        subject: replySubject,
        message: replyMessage,
        attachments: replyAttachments // [{ name: '', url: '' }]
      });

      // Mark the message as read since we replied
      if (!msg.read) {
        await markAsRead(msg.id, false);
      }

      setStatusFeedback({ type: 'success', text: `Reply with ${replyAttachments.length} attachments sent to ${msg.email}!` });
      setTimeout(() => {
        cancelInlineReply();
      }, 2000);
    } catch (err) {
      console.error('Error executing sendReply Callable:', err);
      setStatusFeedback({ type: 'error', text: `Failed to dispatch reply: ${err.message || 'Unknown error'}` });
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 rounded-2xl bg-secondary/20">
        <Mail size={48} className="mb-4 text-white/10" />
        <h3 className="text-xl font-bold text-text mb-2">No messages yet</h3>
        <p className="text-text-muted">When someone fills out your contact form, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Inbox</h2>
          <p className="text-sm text-text-muted">Manage your contact form submissions.</p>
        </div>
        <div className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold border border-accent/20">
          {messages.filter(m => !m.read).length} Unread
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((msg) => {
          const telemetry = msg.telemetry || null;
          const isReplying = activeReplyId === msg.id;

          return (
            <div 
              key={msg.id} 
              className={`p-6 rounded-2xl border transition-colors relative ${msg.read ? 'bg-secondary/20 border-white/5' : 'bg-accent/5 border-accent/30 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.1)]'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-text flex items-center gap-2">
                    {msg.name}
                    {!msg.read && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                  </h3>
                  <a href={`mailto:${msg.email}`} className="text-sm text-accent hover:underline">{msg.email}</a>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Clock size={12} />
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Just now'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm bg-primary/50 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Project Type</span>
                  <span className="text-text">{msg.projectType || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Budget</span>
                  <span className="text-text">{msg.budget || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Timeline</span>
                  <span className="text-text">{msg.timeline || '-'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Website</span>
                  <span className="text-text">{msg.website ? <a href={msg.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">Link</a> : '-'}</span>
                </div>
              </div>

              {/* Telemetry Tracking Badge Panel */}
              {telemetry && (
                <div className="mb-4 flex flex-wrap gap-2 text-[10px] font-mono text-text-muted bg-black/35 p-3 rounded-lg border border-white/5">
                  <span className="flex items-center gap-1 text-accent">
                    <Terminal size={10} /> CLIENT TELEMETRY:
                  </span>
                  <span>IP: {telemetry.ip || 'Cached'}</span>
                  <span>•</span>
                  <span>Pages Viewed: {telemetry.pageViews || 1}</span>
                  <span>•</span>
                  <span>Device: {telemetry.device || 'Desktop/Mobile'}</span>
                  <span>•</span>
                  <span>Referrer: {telemetry.referrer ? telemetry.referrer.substring(0, 30) : 'Direct'}</span>
                </div>
              )}

              <div className="bg-primary/30 p-4 rounded-xl border border-white/5 text-text leading-relaxed whitespace-pre-wrap text-sm mb-4">
                {msg.message}
              </div>

              {/* INLINE REPLY WRAPPER PANEL */}
              {isReplying && (
                <div className="my-4 p-5 rounded-xl border border-accent/25 bg-accent/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest">Compose Reply</span>
                    <button onClick={cancelInlineReply} className="p-1 rounded text-text-muted hover:text-text hover:bg-white/5">
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Subject</label>
                    <input 
                      type="text" 
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full bg-primary/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                    />
                  </div>

                   <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Message Body</label>
                    <textarea 
                      rows={5}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full bg-primary/50 border border-white/10 rounded-lg p-3 text-sm text-text outline-none focus:border-accent font-sans leading-relaxed"
                    />
                  </div>

                  {/* Document & Image Attachments Panel */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted">Attachments</label>
                    
                    {/* Attachments Preview Grid */}
                    {replyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {replyAttachments.map((att, attIdx) => (
                          <div key={attIdx} className="flex items-center gap-2 bg-primary/55 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-text">
                            <FileIcon size={12} className="text-accent" />
                            <span className="max-w-[150px] truncate text-[11px] font-mono">{att.name}</span>
                            <button 
                              type="button" 
                              onClick={() => removeAttachment(attIdx)}
                              className="text-text-muted hover:text-red-400 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* File Upload Selector Action */}
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-primary/45 hover:bg-primary/75 text-xs text-text-muted hover:text-text transition-colors">
                        <Paperclip size={12} />
                        {uploadingFile ? 'Uploading asset...' : 'Attach Image/Doc'}
                        <input 
                          type="file" 
                          onChange={handleFileUpload} 
                          disabled={uploadingFile}
                          className="hidden" 
                          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                        />
                      </label>
                      {uploadingFile && <RefreshCw size={12} className="animate-spin text-accent" />}
                    </div>
                  </div>

                  {statusFeedback.text && (
                    <div className={`text-xs px-3.5 py-2 rounded-lg border font-mono ${statusFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' : 'bg-red-500/10 border-red-500/35 text-red-400'}`}>
                      {statusFeedback.text}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelInlineReply}
                      className="px-3.5 py-2 rounded-lg text-xs font-mono font-bold border border-white/10 hover:bg-white/5 text-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendInlineReply(msg)}
                      disabled={sendingReply || uploadingFile}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-accent text-primary hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {sendingReply ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                  <MessageSquare size={10} /> ID: {msg.id.substring(0, 8)}...
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startInlineReply(msg)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-accent text-primary hover:opacity-90 transition-opacity"
                  >
                    <Send size={14} />
                    Reply
                  </button>
                  <button
                    onClick={() => markAsRead(msg.id, msg.read)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${msg.read ? 'bg-secondary hover:bg-white/10 text-text' : 'bg-accent/20 hover:bg-accent/30 text-accent'}`}
                  >
                    <CheckCircle2 size={14} />
                    {msg.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessagesInbox;
