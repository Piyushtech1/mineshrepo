import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ContactMessage } from '../../server/db/schema';
import { Mail, MailOpen, Archive, Trash2, Reply, Check, Clock } from 'lucide-react';

export const ContactMessagesView: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'inbox' | 'unread' | 'archived'>('inbox');
  const [notice, setNotice] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminContactMessages(statusTab);
      setMessages(res.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [statusTab]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      await api.markMessageRead(msg.id, !msg.read);
      showNotice(`Message marked as ${!msg.read ? 'read' : 'unread'}.`);
      await loadMessages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleArchive = async (msg: ContactMessage) => {
    try {
      await api.archiveMessage(msg.id, !msg.archived);
      showNotice(`Message ${!msg.archived ? 'archived' : 'restored to inbox'}.`);
      await loadMessages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this message?')) return;
    try {
      await api.deleteMessage(id);
      showNotice('Message deleted.');
      await loadMessages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Client Contact Inquiries
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Messages and commission briefs submitted via the public contact form
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['inbox', 'unread', 'archived'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusTab(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusTab === tab
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-16 text-center text-xs font-mono-meta text-zinc-400">
          No inquiries in this folder.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`rounded-xl border p-6 flex flex-col gap-4 transition-colors ${
                !msg.read
                  ? 'border-amber-500/40 bg-zinc-900/80 shadow-md'
                  : 'border-zinc-800 bg-zinc-900/30 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${!msg.read ? 'bg-amber-500' : 'bg-transparent'}`} />
                  <span className="font-heading text-base font-bold text-white">
                    {msg.name}
                  </span>
                  <span className="text-xs font-mono-meta text-zinc-400">
                    &lt;{msg.email}&gt;
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono-meta text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-heading text-sm font-semibold text-amber-400">
                  Subject: {msg.subject}
                </span>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/60">
                  {msg.message}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1.5"
                >
                  <Reply className="h-3.5 w-3.5 text-amber-400" />
                  <span>Reply</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleToggleRead(msg)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5"
                >
                  {msg.read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                  <span>{msg.read ? 'Mark Unread' : 'Mark Read'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleArchive(msg)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>{msg.archived ? 'Unarchive' : 'Archive'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(msg.id)}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
