import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity, Download, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import { getDashboardStats, getRevenueData, getActivities } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, c, a] = await Promise.all([
          getDashboardStats(), 
          getRevenueData(),
          getActivities()
        ]);
        setStats(s);
        setChartData(c);
        setActivities(a);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false); // Ensure loading is set to false even on error
        toast.error("Failed to fetch dashboard data.");
      }
    };
    fetchData();
  }, []);

  const handleDownloadReport = () => {
    setDownloading(true);
    
    setTimeout(() => {
      try {
        // Generate a CSV string from chartData
        const headers = ['Month', 'Revenue (USD)'];
        const csvRows = [headers.join(',')];
        
        chartData.forEach(row => {
          csvRows.push(`${row.name},${row.revenue}`);
        });
        
        // Add Stats Summary
        csvRows.push('');
        csvRows.push('Summary');
        csvRows.push(`Total Revenue,${stats?.revenue || 0}`);
        csvRows.push(`Active Users,${stats?.totalUsers || 0}`);
        csvRows.push(`New Subscriptions,0`);
        csvRows.push(`Active Sessions,${stats?.activeSessions || 0}`);

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Analytics_Report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.success("Report downloaded successfully!");
      } catch (err) {
        toast.error("Failed to download report");
      } finally {
        setDownloading(false);
      }
    }, 1000); // simulate compilation delay
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: stats?.revenue || "$0", trend: stats?.revenueGrowth || "+0%", icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), trend: '+0%', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Active Users', value: stats?.activeUsers || 0, trend: '+0%', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Pending Users', value: stats?.pendingUsers || 0, trend: '-0%', trendDown: true, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Dashboard Overview</h2>
        <button 
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? "Formatting..." : "Download Report"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, idx) => (
          <Card key={card.title} delay={idx * 0.1} hover={true}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)]">{card.title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-[var(--text-main)]">{card.value}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.trendDown ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} strokeWidth={2} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card delay={0.4} className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-6">Revenue Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: '#dc2626', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.5} className="flex flex-col">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-6">User Acquisition</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-color)' }}
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card delay={0.6} className="mt-6">
        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-6">Recent Activities</h3>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--bg-color)] transition-colors border border-transparent hover:border-[var(--border-color)] group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  act.action.includes('Delete') ? 'bg-rose-500' : 
                  act.action.includes('Create') ? 'bg-emerald-500' : 'bg-blue-500'
                }`}>
                  {(act.adminName || 'A').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-main)]">
                    <span className="font-bold">{act.adminName || 'Unknown'}</span> {act.action} <span className="font-semibold text-[var(--primary)]">{act.target || ''}</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center py-8 text-[var(--text-muted)] italic">No activities recorded yet. Start by managing users!</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
