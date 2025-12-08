import { FaMoneyBillWave, FaHandshake, FaHeadset, FaTools } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';

interface Metric {
  label: string;
  value: number | string;
  icon: JSX.Element;
  color: string;
}

export default function OrgOverview() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Finance
        const financeRes = await fetch(`${apiUrl}/financial/dashboard`, { headers });
        const financeData = await financeRes.json();
        // Sales
        const salesRes = await fetch(`${apiUrl}/sales/leads`, { headers });
        const salesData = await salesRes.json();
        // Customer Service (support tickets)
        const csRes = await fetch(`${apiUrl}/support/tickets`, { headers });
        const csData = await csRes.json();
        // Tech Support (filter tickets by department)
        const techTickets = Array.isArray(csData.data) ? csData.data.filter((t: any) => t.department === 'Tech Support') : [];

        setMetrics([
          { label: 'Finance', value: financeData?.totalBalance || '₦0', icon: <FaMoneyBillWave />, color: 'text-green-600' },
          { label: 'Sales', value: salesData?.data?.length || 0, icon: <FaHandshake />, color: 'text-blue-600' },
          { label: 'Customer Service', value: csData?.data?.length || 0, icon: <FaHeadset />, color: 'text-yellow-600' },
          { label: 'Tech Support', value: techTickets.length, icon: <FaTools />, color: 'text-purple-600' },
        ]);

        // Example chart data: last 6 months (replace with real analytics if available)
        const salesAnalyticsRes = await fetch(`${apiUrl}/sales/analytics`, { headers });
        const salesAnalytics = await salesAnalyticsRes.json();
        const financeAnalyticsRes = await fetch(`${apiUrl}/financial/analytics`, { headers });
        const financeAnalytics = await financeAnalyticsRes.json();

        // Compose chart data (example: use months and values from analytics if available)
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setChartData(months.map((month, i) => ({
          month,
          Sales: salesAnalytics?.monthly?.[i]?.count || 0,
          'Customer Service': csData?.monthly?.[i]?.count || 0,
          'Tech Support': techTickets.filter((t: any) => t.month === month).length || 0,
          Revenue: financeAnalytics?.monthly?.[i]?.revenue || 0,
        })));
      } catch (err: any) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  }
  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Organisation Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow cursor-pointer">
              <span className={`text-4xl mb-2 ${m.color}`}>{m.icon}</span>
              <div className="text-lg font-semibold text-gray-800">{m.label}</div>
              <div className="text-2xl font-bold mt-1">{m.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Customer Service" fill="#eab308" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tech Support" fill="#a21caf" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
