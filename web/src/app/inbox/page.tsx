import dynamic from 'next/dynamic';
const InboxPageClient = dynamic(() => import('./InboxPageClient'), { ssr: false });
export default InboxPageClient;
