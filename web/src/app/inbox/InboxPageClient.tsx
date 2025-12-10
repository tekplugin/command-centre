'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';
import { FaInbox, FaArchive, FaTrash, FaStar, FaRegStar, FaReply, FaReplyAll, FaForward, FaPaperclip, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaSearch, FaPlus, FaRegEdit, FaRegSave, FaRegClock, FaRegEnvelopeOpen, FaRegEnvelope, FaBell, FaFolderOpen, FaTag, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface Email {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
  receivedAt: string;
  isRead: boolean;
  isArchived: boolean;
  labels: string[];
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }>;
}

export default function MailPageClient() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: [] as File[],
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('starredEmails') || '[]');
    }
    return [];
  });
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  // Custom folders/labels
  const [folders, setFolders] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('mailFolders') || '["Inbox","Sent","Archive","Spam"]');
    }
    return ["Inbox","Sent","Archive","Spam"];
  });
  const [selectedFolder, setSelectedFolder] = useState('Inbox');
  const [labels, setLabels] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('mailLabels') || '[]');
    }
    return [];
  });
  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleSelect = (id: string) => {
    setSelectedIds((prev: string[]) => prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id]);
  };
  const selectAll = (ids: string[]) => setSelectedIds(ids);
  const clearSelection = () => setSelectedIds([]);

  const toggleStar = (emailId: string) => {
    setStarredIds((prev: string[]) => {
      const updated = prev.includes(emailId)
        ? prev.filter((id: string) => id !== emailId)
        : [...prev, emailId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('starredEmails', JSON.stringify(updated));
      }
      return updated;
    });
  };


  useEffect(() => {
    fetchEmails();
    // eslint-disable-next-line
  }, [filter, selectedFolder]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let url = `${apiUrl}/email/inbox`;
      if (selectedFolder === 'Inbox') {
        if (filter === 'unread') {
          url += '?isRead=false';
        } else if (filter === 'archived') {
          url += '?isArchived=true';
        }
      } else if (selectedFolder === 'Sent') {
        url = `${apiUrl}/email/sent`;
      } else if (selectedFolder === 'Archive') {
        url += '?isArchived=true';
      } else if (selectedFolder === 'Spam') {
        url += '?spam=true';
      } else {
        // Custom folder
        url += `?folder=${encodeURIComponent(selectedFolder)}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const result = await response.json();
        setEmails(result.data || []);
      } else {
        console.error('Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewEmail = async (email: Email) => {
    // Mark as read
    if (!email.isRead) {
      try {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${apiUrl}/email/inbox/${email._id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isRead: true }),
        });
        // Update local state
        setEmails(emails.map((e: Email) =>
          e._id === email._id ? { ...e, isRead: true } : e
        ));
      } catch (error) {
        console.error('Error marking email as read:', error);
      }
    }
    setSelectedEmail(email);
    setShowEmailModal(true);
  };

  const toggleArchive = async (emailId: string, isArchived: boolean) => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiUrl}/email/inbox/${emailId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: !isArchived }),
      });
      fetchEmails();
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error archiving email:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const unreadCount = emails.filter((e: Email) => !e.isRead).length;

  // Threading and search logic (must be after all state declarations)
  const threads = emails.reduce((acc: Record<string, Email[]>, email: Email) => {
    const key = email.subject.replace(/^(Re:|Fwd:)/i, '').trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(email);
    return acc;
  }, {});
  const filteredThreads = Object.entries(threads).filter(([subject, threadEmails]) => {
    const emailsArr = threadEmails as Email[];
    const matchesSearch = subject.toLowerCase().includes(search.toLowerCase()) ||
      emailsArr.some((e: Email) => e.from.toLowerCase().includes(search.toLowerCase()) || e.to.join(',').toLowerCase().includes(search.toLowerCase()));
    const matchesStar = !showStarredOnly || emailsArr.some((e: Email) => starredIds.includes(e._id));
    return matchesSearch && matchesStar;
  });

  // --- Advanced Mail Features: Reply/Forward ---
  const openReply = (type: 'reply' | 'replyAll') => {
    if (!selectedEmail) return;
    let to = '';
    let cc = '';
    if (type === 'reply') {
      to = selectedEmail.from;
    } else {
      to = [selectedEmail.from, ...selectedEmail.to.filter((addr: string) => addr !== /* current user email */ '')].join(', ');
      cc = selectedEmail.cc && Array.isArray(selectedEmail.cc) ? selectedEmail.cc.join(', ') : '';
    }
    setComposeData({
      to,
      cc,
      bcc: '',
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body: `\n\n--- Original Message ---\n${selectedEmail.textBody}`,
      attachments: [],
    });
    setShowComposeModal(true);
  };
  const openForward = () => {
    if (!selectedEmail) return;
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: selectedEmail.subject.startsWith('Fwd:') ? selectedEmail.subject : `Fwd: ${selectedEmail.subject}`,
      body: `\n\n--- Forwarded Message ---\n${selectedEmail.textBody}`,
      attachments: [], // Only allow manual file selection for new attachments
    });
    setShowComposeModal(true);
  };

  // Read receipts
  const [requestReadReceipt, setRequestReadReceipt] = useState(false);
  // Scheduling
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  // Spam filtering (scaffold)
  const [showSpam, setShowSpam] = useState(false);
  // Drafts
  const [drafts, setDrafts] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('mailDrafts') || '[]');
    }
    return [];
  });
  // Signature
  const [signature, setSignature] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mailSignature') || '';
    }
    return '';
  });
  // Notifications (scaffold)
  // useEffect(() => { /* request notification permission, show notification on new mail */ }, []);

  // Example API integration for advanced mail actions
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const starEmail = async (emailId: string, starred: boolean) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/star`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred }),
    });
    fetchEmails();
  };
  const markSpam = async (emailId: string, spam: boolean) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/spam`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ spam }),
    });
    fetchEmails();
  };
  const deleteEmail = async (emailId: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchEmails();
  };
  const restoreEmail = async (emailId: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/restore`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchEmails();
  };
  const moveToFolder = async (emailId: string, folder: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/folder`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });
    fetchEmails();
  };
  const addLabel = async (emailId: string, label: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/label`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    fetchEmails();
  };
  const removeLabel = async (emailId: string, label: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/label/remove`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
    fetchEmails();
  };
  const bulkUpdate = async (emailIds: string[], updates: any) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/bulk`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailIds, updates }),
    });
    fetchEmails();
  };
  // Drafts CRUD
  const fetchDrafts = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiUrl}/email/drafts`, { headers: { 'Authorization': `Bearer ${token}` } });
    return res.json();
  };
  const saveDraft = async (draft: any) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/drafts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    fetchDrafts();
  };
  const updateDraft = async (draftId: string, updates: any) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/drafts/${draftId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    fetchDrafts();
  };
  const deleteDraft = async (draftId: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/drafts/${draftId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchDrafts();
  };
  // Scheduling
  const scheduleEmail = async (email: any) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/send-scheduled`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
  };
  // Read receipts
  const getReadReceipt = async (emailId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiUrl}/email/inbox/${emailId}/receipt`, { headers: { 'Authorization': `Bearer ${token}` } });
    return res.json();
  };
  const updateReadReceipt = async (emailId: string, status: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/inbox/${emailId}/receipt`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };
  // Signature
  const getSignature = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiUrl}/email/signature`, { headers: { 'Authorization': `Bearer ${token}` } });
    return res.json();
  };
  const updateSignature = async (signature: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${apiUrl}/email/signature`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature }),
    });
  };
  // Attachment download
  const getAttachmentUrl = (emailId: string, attId: string) => {
    return `${apiUrl}/email/inbox/${emailId}/attachment/${attId}`;
  };

  return (
    <DashboardLayout>
      {/* All your page content goes here as children */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mail</h1>
              <p className="mt-1 text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Folder/Label Sidebar */}
          <div className="flex flex-col md:flex-row gap-6 w-full h-full">
            {/* Sidebar */}
            <aside className="w-full md:w-56 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4 sticky top-4 h-fit animate-fade-in">
              <div className="flex items-center gap-2 text-lg font-bold text-blue-700 mb-2"><FaInbox /> Mail</div>
              {folders.map(folder => (
                <button
                  key={folder}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${selectedFolder === folder ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'hover:bg-gray-100 text-gray-700'}`}
                  onClick={() => setSelectedFolder(folder)}
                >
                  <FaFolderOpen className="text-gray-400" /> {folder}
                </button>
              ))}
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-150 mt-2"
                onClick={() => {
                  const name = prompt('New folder name?');
                  if (name) {
                    setFolders(f => {
                      const updated = [...f, name];
                      localStorage.setItem('mailFolders', JSON.stringify(updated));
                      return updated;
                    });
                  }
                }}
              ><FaPlus /> Add Folder</button>
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-1">Labels</div>
                {labels.length === 0 && <div className="text-xs text-gray-300">No labels</div>}
                {labels.map(label => (
                  <span key={label} className="inline-flex items-center bg-yellow-100 text-yellow-800 rounded px-2 py-1 text-xs mr-1 mb-1"><FaTag className="mr-1" />{label}</span>
                ))}
              </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-4 animate-fade-in">
              {/* Top Bar */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                {/* Removed duplicate compose and refresh buttons */}
                <div className="flex items-center gap-2">
                  <FaSearch className="text-gray-400" />
                  <input type="text" className="border border-gray-300 rounded-lg p-2 w-full max-w-xs focus:ring-2 focus:ring-blue-200 transition-all duration-150 bg-white text-gray-900 placeholder-gray-500" placeholder="Search mail..." value={search} onChange={e => setSearch(e.target.value)} />
                  <label className="flex items-center gap-1 ml-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={showStarredOnly} onChange={e => setShowStarredOnly(e.target.checked)} className="accent-yellow-500" />
                    <FaStar className="text-yellow-500" /> Starred
                  </label>
                </div>
              </div>
              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="flex gap-2 items-center bg-yellow-50 p-3 rounded-lg shadow animate-fade-in">
                  <span className="font-medium text-gray-700">{selectedIds.length} selected</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-all duration-150" title="Mark as Read"><FaRegEnvelopeOpen /></button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded-lg flex items-center gap-1 hover:bg-gray-700 transition-all duration-150" title="Mark as Unread"><FaRegEnvelope /></button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded-lg flex items-center gap-1 hover:bg-green-700 transition-all duration-150" title="Archive"><FaArchive /></button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded-lg flex items-center gap-1 hover:bg-red-700 transition-all duration-150" title="Delete"><FaTrash /></button>
                  <button className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg flex items-center gap-1 hover:bg-gray-400 transition-all duration-150" onClick={clearSelection}><FaCheckCircle /> Clear</button>
                </div>
              )}
              {/* Thread List */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200 animate-fade-in">
                {loading ? (
                  <div className="text-center py-12 text-gray-400 animate-pulse">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2">Loading emails...</p>
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="text-center py-12 text-gray-300">
                    <span className="text-5xl mb-4 block">📭</span>
                    <p className="text-lg font-medium">No emails yet</p>
                    <p className="text-sm mt-2">{filter === 'unread' ? 'All emails are read' : filter === 'archived' ? 'No archived emails' : 'Your mail is empty'}</p>
                  </div>
                ) : (
                  filteredThreads.map(([subject, threadEmails]) => (
                    <section key={subject} className="group hover:bg-blue-50 transition-all duration-150">
                      <header className="bg-gray-50 px-4 py-2 font-semibold text-gray-800 border-b flex items-center gap-2">
                        <FaChevronDown className="text-gray-400 group-hover:text-blue-500 transition-all duration-150" />
                        <span>{subject}</span>
                        <span className="ml-2 text-xs text-gray-500">({threadEmails.length})</span>
                      </header>
                      {threadEmails.map((email) => (
                        <div key={email._id} className={`flex items-start justify-between p-4 hover:bg-blue-100 cursor-pointer transition-all duration-150 ${!email.isRead ? 'bg-blue-50' : ''}`}>
                          <div className="flex-1 min-w-0 flex gap-3 items-center" onClick={() => viewEmail(email)}>
                            <input type="checkbox" checked={selectedIds.includes(email._id)} onChange={e => { e.stopPropagation(); toggleSelect(email._id); }} className="accent-blue-500" />
                            <button onClick={e => { e.stopPropagation(); toggleStar(email._id); }} className="text-yellow-500 text-lg focus:outline-none" title={starredIds.includes(email._id) ? 'Unstar' : 'Star'}>{starredIds.includes(email._id) ? <FaStar /> : <FaRegStar />}</button>
                            <FaUserCircle className="text-2xl text-gray-400" />
                            <div>
                              <div className={`text-sm font-medium truncate ${!email.isRead ? 'font-bold text-blue-900' : 'text-gray-900'}`}>{email.from}</div>
                              <div className="flex gap-1 items-center text-xs text-gray-500">
                                {email.attachments?.length > 0 && <FaPaperclip className="mr-1" />}
                                {email.labels && email.labels.map((label: string) => <span key={label} className="bg-yellow-100 text-yellow-800 rounded px-1 ml-1">{label}</span>)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-gray-400">{formatDate(email.receivedAt)}</span>
                            <button onClick={e => { e.stopPropagation(); toggleArchive(email._id, email.isArchived); }} className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${email.isArchived ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'} transition-all duration-150`}>{email.isArchived ? <FaArchive /> : <FaArchive />} {email.isArchived ? 'Unarchive' : 'Archive'}</button>
                            <button onClick={e => { e.stopPropagation(); deleteEmail(email._id); }} className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-150" title="Delete"><FaTrash /> Delete</button>
                          </div>
                        </div>
                      ))}
                    </section>
                  ))
                )}
              </div>
              {/* Compose Modal, Email Modal, etc. should also be modernized similarly with rounded, shadow, icons, and transitions. */}
            </main>
          </div>
        </div>

        {/* Email Modal (view) */}
        {showEmailModal && selectedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEmailModal(false)}
              >✖️</button>
              <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
              <div className="mb-2 text-sm text-gray-700">
                <div><span className="font-medium">From:</span> {selectedEmail.from}</div>
                <div><span className="font-medium">To:</span> {selectedEmail.to.join(', ')}</div>
                {selectedEmail.cc && Array.isArray(selectedEmail.cc) && selectedEmail.cc.length > 0 && (
                  <div><span className="font-medium">CC:</span> {selectedEmail.cc.join(', ')}</div>
                )}
                <div><span className="font-medium">Date:</span> {formatDate(selectedEmail.receivedAt)}</div>
              </div>
              <div className="mb-4 text-gray-900 whitespace-pre-wrap border-t pt-2">
                {selectedEmail.htmlBody ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }} />
                ) : (
                  selectedEmail.textBody
                )}
              </div>
              {/* Attachment Preview/Download */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mb-2">
                  <span className="font-medium">Attachments:</span>
                  <ul>
                    {selectedEmail.attachments.map((att, i) => (
                      <li key={i}>
                        <a href={att.url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{att.filename}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => openReply('reply')}
                >Reply</button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => openReply('replyAll')}
                >Reply All</button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={openForward}
                >Forward</button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => setShowEmailModal(false)}
                >Close</button>
                {/* Spam Flag */}
                <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs ml-2" onClick={() => {/* mark as spam logic */}}>Mark as Spam</button>
              </div>
            </div>
          </div>
        )}
        {showComposeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh] flex flex-col">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowComposeModal(false);
                  setSendError(null);
                  setSendSuccess(false);
                }}
                aria-label="Close compose"
              >
                ✖️
              </button>
              <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
              <form
                className="flex flex-col flex-1"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSending(true);
                  setSendError(null);
                  setSendSuccess(false);
                  try {
                    if (typeof window === 'undefined') return;
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                    const formData = new FormData();
                    formData.append('to', composeData.to);
                    formData.append('cc', composeData.cc);
                    formData.append('bcc', composeData.bcc);
                    formData.append('subject', composeData.subject);
                    formData.append('body', composeData.body);
                    for (const file of composeData.attachments) {
                      formData.append('attachments', file);
                    }
                    const response = await fetch(`${apiUrl}/email/mail`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formData,
                    });
                    if (response.ok) {
                      setSendSuccess(true);
                      setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
                    } else {
                      const err = await response.json();
                      setSendError(err.message || 'Failed to send email');
                    }
                  } catch (error: any) {
                    setSendError(error.message || 'Failed to send email');
                  } finally {
                    setSending(false);
                  }
                }}
              >
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">To</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500"
                    value={composeData.to}
                    onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                    required
                    placeholder="user@example.com, ..."
                  />
                </div>
                <div className="mb-2 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">CC</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500"
                      value={composeData.cc}
                      onChange={e => setComposeData({ ...composeData, cc: e.target.value })}
                      placeholder="cc@example.com, ..."
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">BCC</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500"
                      value={composeData.bcc}
                      onChange={e => setComposeData({ ...composeData, bcc: e.target.value })}
                      placeholder="bcc@example.com, ..."
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500"
                    value={composeData.subject}
                    onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Body</label>
                  <RichTextEditor
                    value={composeData.body}
                    onChange={val => setComposeData({ ...composeData, body: val })}
                  />
                </div>
                {/* Read Receipt Checkbox */}
                <div className="mb-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={requestReadReceipt} onChange={e => setRequestReadReceipt(e.target.checked)} />
                    <span className="ml-2 text-sm text-gray-700">Request read receipt</span>
                  </label>
                </div>
                {/* Schedule Send */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Send later</label>
                  <input type="datetime-local" value={scheduleDate || ''} onChange={e => setScheduleDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500" />
                </div>
                {/* Signature Editor */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Signature</label>
                  <textarea className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500 bg-white text-gray-900 placeholder-gray-500" rows={2} value={signature} onChange={e => { setSignature(e.target.value); localStorage.setItem('mailSignature', e.target.value); }} />
                </div>
                {/* Drafts List */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Drafts</label>
                  <ul className="text-xs text-gray-600">
                    {drafts.map((d, i) => (
                      <li key={i}><button className="underline" onClick={() => setComposeData(d)}>Draft {i + 1}</button></li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Attachments</label>
                  <input
                    type="file"
                    multiple
                    onChange={e => {
                      if (e.target.files) {
                        setComposeData({ ...composeData, attachments: Array.from(e.target.files) });
                      }
                    }}
                  />
                </div>
                {sendError && <div className="text-red-600 mb-2">{sendError}</div>}
                {sendSuccess && <div className="text-green-600 mb-2">Email sent successfully!</div>}
                <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-2 flex justify-end gap-2 border-t mt-4 z-10">
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    onClick={() => {
                      setShowComposeModal(false);
                      setSendError(null);
                      setSendSuccess(false);
                    }}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
