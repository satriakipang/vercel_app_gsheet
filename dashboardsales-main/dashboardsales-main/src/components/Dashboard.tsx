import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  MapPin,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Search,
  Trophy,
  Medal
} from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, parse } from 'date-fns';
import { SalesData } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  data: SalesData[];
  loading: boolean;
  initialView?: 'dashboard' | 'transactions' | 'sales';
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({ data, loading, initialView = 'dashboard' }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: '',
    month: '',
    channel: '',
    product: '',
    category: '',
  });

  const filteredData = useMemo(() => {
    return data
      .filter(item => {
        const date = parseISO(item.date);
        const matchesYear = !filters.year || format(date, 'yyyy') === filters.year;
        const matchesMonth = !filters.month || format(date, 'MMMM yyyy') === filters.month;
        const matchesChannel = !filters.channel || item.channel === filters.channel;
        const matchesProduct = !filters.product || item.product.toLowerCase().includes(filters.product.toLowerCase());
        const matchesCategory = !filters.category || item.category === filters.category;

        return matchesYear && matchesMonth && matchesChannel && matchesProduct && matchesCategory;
      })
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [data, filters]);

  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.total_price, 0);
    const totalOrders = filteredData.length;
    const totalQuantity = filteredData.reduce((acc, curr) => acc + curr.quantity, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, totalQuantity, avgOrderValue };
  }, [filteredData]);

  const revenueByDate = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      const dateKey = format(parseISO(curr.date), 'yyyy-MM-dd');
      acc[dateKey] = (acc[dateKey] || 0) + curr.total_price;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, revenue]) => ({ 
        date, 
        displayDate: format(parseISO(date), 'MMM dd'),
        revenue 
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const revenueByCategory = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.total_price;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const revenueByChannel = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      acc[curr.channel] = (acc[curr.channel] || 0) + curr.total_price;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const revenueByCity = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      acc[curr.city] = (acc[curr.city] || 0) + curr.total_price;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value);
  }, [filteredData]);

  const topProducts = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      acc[curr.product] = (acc[curr.product] || 0) + curr.total_price;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  const salesRepStats = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, curr) => {
      if (!acc[curr.sales_rep]) {
        acc[curr.sales_rep] = {
          name: curr.sales_rep,
          totalRevenue: 0,
          totalOrders: 0,
          totalQuantity: 0,
          categories: {},
          topProduct: { name: '', value: 0 }
        };
      }
      const rep = acc[curr.sales_rep];
      rep.totalRevenue += curr.total_price;
      rep.totalOrders += 1;
      rep.totalQuantity += curr.quantity;
      rep.categories[curr.category] = (rep.categories[curr.category] || 0) + curr.total_price;
      
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  }, [filteredData]);

  const uniqueValues = useMemo(() => {
    const years = Array.from(new Set(data.map(item => format(parseISO(item.date), 'yyyy')))).sort((a: string, b: string) => b.localeCompare(a));
    
    // Filter months based on selected year
    const months = Array.from(new Set(
      data
        .filter(item => !filters.year || format(parseISO(item.date), 'yyyy') === filters.year)
        .map(item => format(parseISO(item.date), 'MMMM yyyy'))
    )).sort((a: string, b: string) => {
      return parse(b, 'MMMM yyyy', new Date()).getTime() - parse(a, 'MMMM yyyy', new Date()).getTime();
    });

    return {
      channels: Array.from(new Set(data.map(item => item.channel))),
      categories: Array.from(new Set(data.map(item => item.category))),
      years,
      months,
    };
  }, [data, filters.year]);

  // Reset month filter if it doesn't belong to the selected year
  React.useEffect(() => {
    if (filters.month && filters.year) {
      const monthYear = filters.month.split(' ')[1];
      if (monthYear !== filters.year) {
        setFilters(prev => ({ ...prev, month: '' }));
      }
    }
  }, [filters.year]);

  const resetFilters = () => {
    setFilters({
      year: '',
      month: '',
      channel: '',
      product: '',
      category: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Simplified Essential Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[120px] space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Year
            </label>
            <select 
              value={filters.year}
              onChange={e => setFilters({...filters, year: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Years</option>
              {uniqueValues.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Month
            </label>
            <select 
              value={filters.month}
              onChange={e => setFilters({...filters, month: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Months</option>
              {uniqueValues.months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Channel
            </label>
            <select 
              value={filters.channel}
              onChange={e => setFilters({...filters, channel: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Channels</option>
              {uniqueValues.channels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Package className="w-3 h-3" /> Category
            </label>
            <select 
              value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {uniqueValues.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-[1.5] min-w-[200px] space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Search className="w-3 h-3" /> Search Product
            </label>
            <input 
              type="text" 
              placeholder="Type product name..."
              value={filters.product}
              onChange={e => setFilters({...filters, product: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-none flex items-center gap-3 self-end pb-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="text-indigo-600">{filteredData.length}</span> / {data.length}
            </div>
            {Object.values(filters).some(v => v !== '') && (
              <button 
                onClick={resetFilters}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                title="Clear All Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - Flexible wrap layout to prevent overlap */}
      {initialView === 'dashboard' && (
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[280px]">
            <StatCard 
              title="Total Revenue" 
              value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
              icon={<DollarSign className="w-6 h-6 text-indigo-600" />}
              trend="+12.5%"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders.toLocaleString()}
              icon={<ShoppingCart className="w-6 h-6 text-emerald-600" />}
              trend="+5.2%"
            />
          </div>
          <div className="flex-1 min-w-[280px]">
            <StatCard 
              title="Avg Order Value" 
              value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.avgOrderValue)}
              icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
              trend="-2.1%"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatCard 
              title="Items Sold" 
              value={stats.totalQuantity.toLocaleString()}
              icon={<Package className="w-6 h-6 text-rose-600" />}
              trend="+8.4%"
            />
          </div>
        </div>
      )}

      {initialView === 'dashboard' ? (
        <>
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Revenue Performance
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Gross Revenue</span>
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByDate}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis 
                      dataKey="displayDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                      tickFormatter={(val) => `Rp${val/1000}k`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: '1px solid #f1f5f9', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}
                      labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}
                      formatter={(value: number) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value), 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Category Mix</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-400" />
                Performance by Channel
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByChannel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={120} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" />
                Top 5 Products by Revenue
              </h3>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold", 
                        idx === 0 ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-600")}>
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-700">{product.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" />
                Category Summary
              </h3>
              <div className="space-y-4">
                {revenueByCategory.sort((a, b) => b.value - a.value).map((cat, idx) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(cat.value)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${(cat.value / stats.totalRevenue) * 100}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-400" />
                City Performance
              </h3>
              <div className="space-y-4">
                {revenueByCity.slice(0, 5).map((city, idx) => (
                  <div key={city.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-700">{city.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(city.value)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {Math.round((city.value / stats.totalRevenue) * 100)}% Contribution
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : initialView === 'sales' ? (
        /* Sales Rep Performance View */
        <div className="space-y-8">
          {/* Sales Ranking Leaderboard */}
          {salesRepStats.length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Trophy className="w-32 h-32 text-indigo-600" />
              </div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sales Ranking</h3>
                  <p className="text-xs text-slate-500">Top performing representatives based on revenue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {salesRepStats.slice(0, 3).map((rep: any, idx) => (
                  <div key={rep.name} className={cn(
                    "relative p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                    idx === 0 ? "bg-indigo-50 border-indigo-100 ring-1 ring-indigo-200" : "bg-slate-50 border-slate-100"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shadow-sm",
                      idx === 0 ? "bg-amber-400 text-white" : idx === 1 ? "bg-slate-300 text-slate-600" : "bg-amber-600/20 text-amber-700"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rep.name}</p>
                      <p className="text-lg font-black text-slate-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(rep.totalRevenue)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Medal className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{rep.totalOrders} Orders</span>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm uppercase tracking-widest">
                        Top Performer
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {salesRepStats.map((rep: any, idx) => (
              <div key={rep.name} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative">
                {/* Rank Badge */}
                <div className={cn(
                  "absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm z-10",
                  idx === 0 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  #{idx + 1}
                </div>

                <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
                      {rep.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{rep.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Representative</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
                      <p className="text-sm font-black text-slate-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(rep.totalRevenue)}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Orders</p>
                      <p className="text-sm font-black text-slate-900">{rep.totalOrders} Orders</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Contribution</p>
                    <div className="space-y-2">
                      {Object.entries(rep.categories).map(([cat, val]: any, idx) => (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-600">{cat}</span>
                            <span className="text-slate-900">{Math.round((val / rep.totalRevenue) * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${(val / rep.totalRevenue) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Avg Order Value</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(rep.totalRevenue / rep.totalOrders)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {salesRepStats.length === 0 && (
            <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Sales Representatives Found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your filters to see performance data.</p>
            </div>
          )}
        </div>
      ) : (
        /* Full Transactions Table View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Showing {filteredData.length} results</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-900 font-mono whitespace-nowrap">{order.order_id}</td>
                    <td className="px-6 py-4 text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">{format(parseISO(order.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-700 whitespace-nowrap">{order.customer_name}</span>
                        <span className="text-[8px] sm:text-[10px] text-slate-400 whitespace-nowrap">{order.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-700 whitespace-nowrap">{order.product}</span>
                        <span className="text-[8px] sm:text-[10px] text-slate-400 whitespace-nowrap">{order.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-900 text-right font-mono whitespace-nowrap">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total_price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter bg-emerald-50 text-emerald-600 border border-emerald-100 whitespace-nowrap">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No results found</h3>
                <p className="text-slate-500">Try adjusting your filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors duration-300">
          {React.cloneElement(icon as React.ReactElement, { className: cn((icon as React.ReactElement).props.className, "group-hover:scale-110 transition-transform duration-300") })}
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider",
            trend.startsWith('+') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          )}>
            {trend}
          </span>
        )}
      </div>
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
    </div>
    <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words leading-tight" title={value}>
      {value}
    </p>
  </div>
);
