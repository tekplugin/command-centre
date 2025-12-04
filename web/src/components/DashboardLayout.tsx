'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * IMPORTANT UI VISIBILITY RULE:
 * Always add explicit text color classes (text-gray-900, text-white, etc.) to ALL text elements
 * to ensure proper contrast and visibility. Never rely on default text colors!
 */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Fault Tickets', href: '/tickets', icon: '🎫' },
    { name: 'Engineers', href: '/engineers', icon: '👷' },
    { name: 'Inventory', href: '/inventory', icon: '📦' },
    { name: 'Finance', href: '/cfo', icon: '💰' },
    { name: 'HR', href: '/hr', icon: '👥' },
    { name: 'Sales', href: '/sales', icon: '💼' },
    { name: 'Marketing', href: '/marketing', icon: '📣' },
    { name: 'Projects', href: '/projects', icon: '📋' },
    { name: 'Legal', href: '/legal', icon: '⚖️' },
    { name: 'Inbox', href: '/inbox', icon: '📧' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-xl font-bold">Command Centre</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-white">Logout</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
