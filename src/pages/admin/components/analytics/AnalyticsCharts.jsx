import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-white font-mono text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TrafficChart = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => value > 0 ? value : ''}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="pageViews" 
            name="Page Views"
            stroke="#38bdf8" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPageViews)" 
          />
          <Area 
            type="monotone" 
            dataKey="sessions" 
            name="Sessions"
            stroke="#818cf8" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSessions)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DeviceDonutChart = ({ data }) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" fontSize={10} textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="h-[250px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LocationBarChart = ({ data }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            width={80}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
          />
          <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrafficSourcesChart = ({ data }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
          />
          <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PerformanceGauge = ({ label, value, type = 'ms' }) => {
  let color = 'text-emerald-400';
  let indicator = 'Good';
  
  if (label === 'LCP') {
    if (value > 2500) { color = 'text-amber-400'; indicator = 'Needs Improvement'; }
    if (value > 4000) { color = 'text-red-400'; indicator = 'Poor'; }
  } else if (label === 'CLS') {
    if (value > 0.1) { color = 'text-amber-400'; indicator = 'Needs Improvement'; }
    if (value > 0.25) { color = 'text-red-400'; indicator = 'Poor'; }
  } else if (label === 'INP') {
    if (value > 200) { color = 'text-amber-400'; indicator = 'Needs Improvement'; }
    if (value > 500) { color = 'text-red-400'; indicator = 'Poor'; }
  }

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
      <span className="text-slate-400 text-xs font-bold mb-1 tracking-wider">{label}</span>
      <div className={`text-2xl font-mono font-bold ${color}`}>
        {value === null || value === undefined || isNaN(value) ? '-' : (type === 'ms' ? `${Math.round(value)}ms` : value.toFixed(3))}
      </div>
      <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">{indicator}</span>
    </div>
  );
};
