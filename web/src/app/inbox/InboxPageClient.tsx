'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

interface Email {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
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
  }>;
}

export default function InboxPageClient() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    fetchEmails();
    // eslint-disable-next-line
  }, [filter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let url = `${apiUrl}/email/inbox`;
      if (filter === 'unread') {
        url += '?isRead=false';
      } else if (filter === 'archived') {
        url += '?isArchived=true';
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
        setEmails(emails.map(e => 
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

  const unreadCount = emails.filter(e => !e.isRead).length;

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Email Inbox</h1>
              <p className="mt-1 text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <button
              onClick={fetchEmails}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFilter('all')}
                className={`$
                  filter === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Emails
                <span className="ml-2 bg-gray-100 text-gray-900 px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {emails.length}
                </span>
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`$
                  filter === 'unread'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`$
                  filter === 'archived'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Archived
              </button>
            </nav>
          </div>

          {/* Email List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-lg font-medium">No emails yet</p>
                <p className="text-sm mt-2">
                  {filter === 'unread' ? 'All emails are read' : filter === 'archived' ? 'No archived emails' : 'Your inbox is empty'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {emails.map((email) => (
                  <div
                    key={email._id}
                    onClick={() => viewEmail(email)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !email.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${!email.isRead ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                          <p className={`text-sm font-medium text-gray-900 truncate ${!email.isRead ? 'font-bold' : ''}`}>
                            {email.from}
                          </p>
                          {email.attachments?.length > 0 && (
                            <span className="text-gray-400">📎</span>
                          )}
                        </div>
                        <p className={`mt-1 text-sm text-gray-900 truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                          {email.subject || '(No Subject)'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {email.textBody.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {formatDate(email.receivedAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(email._id, email.isArchived);
                          }}
                          className={`mt-2 px-2 py-1 rounded text-xs font-medium ${email.isArchived ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'}`}
                        >
                          {email.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
