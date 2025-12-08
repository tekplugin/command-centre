import dynamic from 'next/dynamic';
const MailPageClient = dynamic(() => import('./InboxPageClient'), { ssr: false });
export default MailPageClient;
