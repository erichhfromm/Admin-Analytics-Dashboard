import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, MousePointer2, Smartphone, Monitor } from 'lucide-react';
import Card from '../components/Card';
import { getRevenueData } from '../services/api';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const deviceData = [
    { name: 'Mobile', value: 400, color: '#dc2626', icon: Smartphone },
    { name: 'Desktop', value: 300, color: '#171717', icon: Monitor },
    { name: 'Tablet', value: 300, color: '#f87171', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Deep Analytics</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Detailed breakdown of traffic and usage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-6">Traffic Over Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: '#dc2626', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col h-[400px]">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-6">Device Sessions</h3>
          <div className="flex-1 w-full flex flex-col justify-center min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
               <span className="text-2xl font-bold text-[var(--text-main)]">1K</span>
               <span className="text-xs text-[var(--text-muted)]">Users</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {deviceData.map(d => (
              <div key={d.name} className="text-center">
                <d.icon size={16} className="mx-auto mb-1 text-[var(--text-muted)]" style={{ color: d.color }} />
                <p className="text-xs font-semibold text-[var(--text-main)]">{d.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{(d.value/10)}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Bounce Rate", val: "42.3%", trend: "-1.5%", desc: "vs last month", bad: false, icon: MousePointer2 },
          { title: "Avg. Session", val: "00:03:45", trend: "+12s", desc: "vs last month", bad: false, icon: Activity },
          { title: "Exit Rate", val: "21.2%", trend: "+2.1%", desc: "vs last month", bad: true, icon: MousePointer2 },
        ].map((stat, i) => (
          <Card key={i} delay={0.2 + (i * 0.1)} hover={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-muted)]">{stat.title}</p>
                <h3 className="text-3xl font-bold text-[var(--text-main)] mt-2">{stat.val}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  <span className={`font-semibold ${stat.bad ? 'text-rose-500' : 'text-emerald-500'}`}>{stat.trend}</span> {stat.desc}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full text-red-500">
                <stat.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
