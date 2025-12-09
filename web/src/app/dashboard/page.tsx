'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import OrgOverview from './OrgOverview';
import { FaProjectDiagram, FaTicketAlt, FaHandshake } from 'react-icons/fa';

// Define types
interface User {
  name: string;
  email: string;
  role: string;
}
interface Deal { id: string; name: string; value: number; status: string; }
interface Project { id: string; name: string; status: string; }
interface Ticket { id: string; subject: string; status: string; }

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [salesDeals, setSalesDeals] = useState<Deal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      if (userData) setUser(JSON.parse(userData));
    } catch (e) {
      setError('Failed to load user data.');
      setLoading(false);
      return;
    }
    try {
      const savedDeals = localStorage.getItem('sales_deals');
      if (savedDeals) setSalesDeals(JSON.parse(savedDeals));
    } catch {}
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));
    } catch {}
    try {
      const savedTickets = localStorage.getItem('tickets');
      if (savedTickets) setTickets(JSON.parse(savedTickets));
    } catch {}
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <OrgOverview />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user.name}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow cursor-pointer">
            <FaHandshake className="text-blue-500 text-4xl mb-2" />
            <div className="text-lg font-semibold text-gray-800">Sales Deals</div>
            <div className="text-2xl font-bold text-blue-700">{salesDeals.length}</div>
            <Link href="/sales"><a className="mt-2 text-blue-600 hover:underline">View Deals</a></Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow cursor-pointer">
            <FaProjectDiagram className="text-green-500 text-4xl mb-2" />
            <div className="text-lg font-semibold text-gray-800">Projects</div>
            <div className="text-2xl font-bold text-green-700">{projects.length}</div>
            <Link href="/projects"><a className="mt-2 text-green-600 hover:underline">View Projects</a></Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow cursor-pointer">
            <FaTicketAlt className="text-yellow-500 text-4xl mb-2" />
            <div className="text-lg font-semibold text-gray-800">Support Tickets</div>
            <div className="text-2xl font-bold text-yellow-700">{tickets.length}</div>
            <Link href="/tickets"><a className="mt-2 text-yellow-600 hover:underline">View Tickets</a></Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
