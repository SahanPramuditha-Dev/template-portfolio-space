import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Mail, Trash2, CheckCircle2, Clock, Send, Eye, MessageSquare, Terminal } from 'lucide-react';
import { db } from '../lib/firebase';
import { CMS_DOCS } from '../lib/cms';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleReplyMailto = (msg) => {
    const subject = encodeURIComponent(`Re: Inquiry from ${msg.name} - Sahan Pramuditha Portfolio`);
    const body = encodeURIComponent(
      `Hi ${msg.name},\n\nThank you for reaching out! Regarding your inquiry about "${msg.projectType || 'Project'}" with a budget of "${msg.budget || 'Not Specified'}"...\n\n---\nOriginal Message:\n"${msg.message}"`
    );
    const link = document.createElement('a');
    link.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
    link.click();
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

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                  <MessageSquare size={10} /> ID: {msg.id.substring(0, 8)}...
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReplyMailto(msg)}
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
