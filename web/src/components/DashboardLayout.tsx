'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * IMPORTANT UI VISIBILITY RULE:
 * Always add explicit text color classes (text-gray-900, text-white, etc.) to ALL text elements
 * to ensure proper contrast and visibility. Never rely on default text colors!
 */

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  departments?: string[];
  lastLogin?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        setUserRoles(parsedUser.roles || []);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Format last login date
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user is global admin
  const isGlobalAdmin = userRoles.includes('admin');
  const isExecutive = userRoles.includes('executive');
  const userDepartments = userData?.departments || [];

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['admin', 'executive'], department: null },
    { name: 'Inbox', href: '/inbox', icon: '📬', roles: ['admin', 'executive', 'manager', 'staff'], department: null },
    { name: 'Users', href: '/users', icon: '👤', roles: ['admin'], department: null }, // Only admins
    { name: 'Assets', href: '/assets', icon: '🏢', roles: ['admin', 'executive', 'manager', 'staff'], department: 'finance' },
    { name: 'Finance', href: '/cfo', icon: '💰', roles: ['admin', 'executive', 'manager', 'staff'], department: 'finance' },
    { name: 'HR', href: '/hr', icon: '👥', roles: ['admin', 'executive', 'manager', 'staff'], department: 'hr' },
    { name: 'Sales', href: '/sales', icon: '💼', roles: ['admin', 'executive', 'manager', 'staff'], department: 'sales' },
    { name: 'Marketing', href: '/marketing', icon: '📣', roles: ['admin', 'executive', 'manager', 'staff'], department: 'marketing' },
    { name: 'Legal', href: '/legal', icon: '⚖️', roles: ['admin', 'executive', 'manager', 'staff'], department: 'legal' },
    { name: 'IT', href: '/it', icon: '💻', roles: ['admin', 'executive', 'manager', 'staff'], department: 'it' },
    { name: 'Procurement', href: '/procurement', icon: '🛒', roles: ['admin', 'executive', 'manager', 'staff'], department: 'procurement' },
    { name: 'Customer Service', href: '/customer-service', icon: '☎️', roles: ['admin', 'executive', 'manager', 'staff'], department: 'customer_service' },
    { name: 'Tech Support', href: '/tech-support', icon: '🔧', roles: ['admin', 'executive', 'manager', 'staff'], department: 'tech_support' },
  ];

  // Filter navigation based on user roles AND departments
  const filteredNavigation = navigation.filter(item => {
    // Check if user has required role
    const hasRole = item.roles.some(role => userRoles.includes(role));
    if (!hasRole) return false;
    
    // Admin and Executive see everything
    if (isGlobalAdmin || isExecutive) return true;
    
    // For staff/managers, ONLY show items they have department access to
    if (item.department) {
      return userDepartments.includes(item.department);
    }
    
    // Hide non-department items (like Dashboard) from staff/managers
    return false;
  });

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
              {filteredNavigation.map((item) => (
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
        {/* User Info Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-1">
                      {userData?.roles?.map(role => role.toUpperCase()).join(', ') || 'N/A'}
                    </span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-700">Last Login:</span>
                    <span className="ml-1">{formatLastLogin(userData?.lastLogin)}</span>
                  </span>
                </div>
                <div className="flex items-center mt-1 text-xs">
                  <span className="font-medium text-gray-700 mr-2">Access:</span>
                  {userData?.roles?.includes('admin') ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      All Features (Global Admin)
                    </span>
                  ) : userData?.roles?.includes('executive') ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      All Departments (Executive)
                    </span>
                  ) : userData?.departments && userData.departments.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {userData.departments.map((dept: string) => (
                        <span
                          key={dept}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                        >
                          {dept.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      No departments assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {userData?.email}
            </div>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
