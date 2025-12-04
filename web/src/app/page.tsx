'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        
        setRedirecting(true);
        if (token) {
          console.log('Redirecting to dashboard...');
          router.push('/dashboard');
        } else {
          console.log('Redirecting to login...');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Command Centre</h1>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </main>
  );
}
