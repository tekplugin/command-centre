'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkDepartmentAccess, getDepartmentForRoute } from '@/middleware/departmentAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredDepartment?: string;
}

export default function ProtectedRoute({ children, requiredDepartment }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = () => {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        router.push('/login');
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        const department = requiredDepartment || getDepartmentForRoute(pathname);
        const access = checkDepartmentAccess(department, userData);
        
        if (!access) {
          // Redirect to dashboard if no access
          router.push('/dashboard');
          return;
        }
        
        setHasAccess(true);
      } catch (error) {
        console.error('Error checking access:', error);
        router.push('/login');
      }
    };

    checkAccess();
  }, [pathname, requiredDepartment, router]);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this module.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
