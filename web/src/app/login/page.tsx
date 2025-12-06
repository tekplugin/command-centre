'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Demo mode - bypass backend
      const demoUsers: Record<string, any> = {
        'ofolufemi@tekplugin.com': {
          password: 'admin123',
          user: {
            id: '1',
            email: 'ofolufemi@tekplugin.com',
            firstName: 'Olufemi',
            lastName: 'Ogunleye',
            roles: ['admin'],
            departments: ['hr', 'finance', 'sales', 'marketing', 'legal', 'engineering', 'operations', 'it', 'procurement', 'customer_service']
          }
        },
        'hr@company.com': {
          password: 'hr123',
          user: {
            id: '2',
            email: 'hr@company.com',
            firstName: 'HR',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['hr']
          }
        },
        'finance@company.com': {
          password: 'finance123',
          user: {
            id: '3',
            email: 'finance@company.com',
            firstName: 'Finance',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['finance']
          }
        },
        'sales@company.com': {
          password: 'sales123',
          user: {
            id: '4',
            email: 'sales@company.com',
            firstName: 'Sales',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['sales']
          }
        },
        'marketing@company.com': {
          password: 'marketing123',
          user: {
            id: '5',
            email: 'marketing@company.com',
            firstName: 'Marketing',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['marketing']
          }
        },
        'legal@company.com': {
          password: 'legal123',
          user: {
            id: '6',
            email: 'legal@company.com',
            firstName: 'Legal',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['legal']
          }
        },
        'engineering@company.com': {
          password: 'engineering123',
          user: {
            id: '7',
            email: 'engineering@company.com',
            firstName: 'Engineering',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['engineering']
          }
        },
        'operations@company.com': {
          password: 'operations123',
          user: {
            id: '8',
            email: 'operations@company.com',
            firstName: 'Operations',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['operations']
          }
        },
        'it@company.com': {
          password: 'it123',
          user: {
            id: '9',
            email: 'it@company.com',
            firstName: 'IT',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['it']
          }
        },
        'procurement@company.com': {
          password: 'procurement123',
          user: {
            id: '10',
            email: 'procurement@company.com',
            firstName: 'Procurement',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['procurement']
          }
        },
        'service@company.com': {
          password: 'service123',
          user: {
            id: '11',
            email: 'service@company.com',
            firstName: 'Customer Service',
            lastName: 'Manager',
            roles: ['staff'],
            departments: ['customer_service']
          }
        },
        'techsupport@company.com': {
          password: 'techsupport123',
          user: {
            id: '12',
            email: 'techsupport@company.com',
            firstName: 'Tech Support',
            lastName: 'Specialist',
            roles: ['staff'],
            departments: ['tech_support']
          }
        },
      };

      const demoUser = demoUsers[email.toLowerCase()];
      
      if (demoUser && demoUser.password === password) {
        // Demo login successful
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(demoUser.user));
        
        const user = demoUser.user;
        const roles = user.roles || [];
        const departments = user.departments || [];
        
        // Admin and Executive go to dashboard
        if (roles.includes('admin') || roles.includes('executive')) {
          router.push('/dashboard');
        } else if (departments.length > 0) {
          // Staff/Manager: redirect to their first assigned department
          const departmentRoutes: Record<string, string> = {
            'finance': '/cfo',
            'hr': '/hr',
            'sales': '/sales',
            'marketing': '/marketing',
            'legal': '/legal',
            'engineering': '/engineers',
            'operations': '/inventory',
            'it': '/it',
            'procurement': '/procurement',
            'customer_service': '/customer-service',
            'tech_support': '/tech-support',
          };
          
          const firstDept = departments[0];
          const route = departmentRoutes[firstDept] || '/hr';
          router.push(route);
        } else {
          setError('No departments assigned. Contact your administrator.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        return;
      }

      // Try backend API if demo fails
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on user role and departments
      const user = data.user;
      const roles = user.roles || [];
      const departments = user.departments || [];
      
      // Admin and Executive go to dashboard
      if (roles.includes('admin') || roles.includes('executive')) {
        router.push('/dashboard');
      } else if (departments.length > 0) {
        // Staff/Manager: redirect to their first assigned department
        const departmentRoutes: Record<string, string> = {
          'finance': '/cfo',
          'hr': '/hr',
          'sales': '/sales',
          'marketing': '/marketing',
          'legal': '/legal',
          'engineering': '/engineers',
          'operations': '/inventory',
          'it': '/it',
          'procurement': '/procurement',
          'customer_service': '/customer-service',
        };
        
        const firstDept = departments[0];
        const route = departmentRoutes[firstDept] || '/hr';
        router.push(route);
      } else {
        // No departments assigned - show error
        setError('No departments assigned. Contact your administrator.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Command Centre Staff Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Don't have an account? Contact your administrator
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
