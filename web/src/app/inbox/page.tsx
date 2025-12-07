import dynamic from 'next/dynamic';
const InboxPageClient = dynamic(() => import('./InboxPageClient'), { ssr: false });
export default InboxPageClient;
                className={`${
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
                className={`${
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
                className={`${
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
                      <div className="ml-4 flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500">
                          {formatDate(email.receivedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Detail Modal */}
      {showEmailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedEmail.subject || '(No Subject)'}
              </h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Email Details */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-500 w-20">From:</span>
                  <span className="text-sm text-gray-900">{selectedEmail.from}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-500 w-20">To:</span>
                  <span className="text-sm text-gray-900">{selectedEmail.to.join(', ')}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-500 w-20">Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                  </span>
                </div>
                {selectedEmail.attachments?.length > 0 && (
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-gray-500 w-20">Attachments:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((att, idx) => (
                        <span key={idx} className="text-sm bg-gray-200 px-2 py-1 rounded">
                          📎 {att.filename} ({(att.size / 1024).toFixed(1)} KB)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selectedEmail.htmlBody ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                  {selectedEmail.textBody}
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => toggleArchive(selectedEmail._id, selectedEmail.isArchived)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {selectedEmail.isArchived ? '📥 Unarchive' : '🗃️ Archive'}
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
