import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SalesData } from './types';
import { LayoutDashboard, Settings, HelpCircle, Bell, Search, ExternalLink, Database, ShoppingCart, Users } from 'lucide-react';
import { cn } from './lib/utils';

// Mock data based on the user's image for initial preview
const MOCK_DATA: SalesData[] = [
  { id: 1, date: "2024-06-14", channel: "Offline - Agen", order_id: "ORD-20240614-9508", product: "Minyak Goreng 1L", category: "Retail", quantity: 11, price_per_unit: 18045, total_price: 198495, customer_name: "Customer 145", city: "Tangerang", payment_method: "QRIS", sales_rep: "Budi" },
  { id: 2, date: "2024-01-15", channel: "Online - Website", order_id: "ORD-20240115-7816", product: "Beras 5kg", category: "Retail", quantity: 17, price_per_unit: 24921, total_price: 423657, customer_name: "Customer 134", city: "Depok", payment_method: "QRIS", sales_rep: "Andi" },
  { id: 3, date: "2024-12-01", channel: "Online - Marketplace", order_id: "ORD-20241201-5079", product: "Beras 5kg", category: "Retail", quantity: 5, price_per_unit: 12845, total_price: 64225, customer_name: "Customer 192", city: "Bandung", payment_method: "COD", sales_rep: "Lina" },
  { id: 4, date: "2025-01-01", channel: "Online - WhatsApp", order_id: "ORD-20250101-3315", product: "Telur Ayam Kampung", category: "Poultry", quantity: 1, price_per_unit: 50282, total_price: 50282, customer_name: "Customer 193", city: "Depok", payment_method: "E-Wallet", sales_rep: "Budi" },
  { id: 5, date: "2024-03-13", channel: "Online - Website", order_id: "ORD-20240313-4895", product: "Ayam Potong", category: "Poultry", quantity: 3, price_per_unit: 7672, total_price: 23016, customer_name: "Customer 142", city: "Depok", payment_method: "COD", sales_rep: "Tono" },
  { id: 6, date: "2024-05-12", channel: "Offline - Toko", order_id: "ORD-20240512-3267", product: "Ayam Kampung Hidup", category: "Poultry", quantity: 15, price_per_unit: 49594, total_price: 743910, customer_name: "Customer 228", city: "Jakarta", payment_method: "Transfer", sales_rep: "Fajar" },
  { id: 7, date: "2024-09-18", channel: "Online - Marketplace", order_id: "ORD-20240918-6030", product: "Air Mineral Botol", category: "Retail", quantity: 18, price_per_unit: 26809, total_price: 482562, customer_name: "Customer 240", city: "Jakarta", payment_method: "COD", sales_rep: "Dewi" },
  { id: 8, date: "2024-04-17", channel: "Online - Marketplace", order_id: "ORD-20240417-9273", product: "Gula 1kg", category: "Retail", quantity: 17, price_per_unit: 7860, total_price: 133620, customer_name: "Customer 132", city: "Bandung", payment_method: "E-Wallet", sales_rep: "Fajar" },
  { id: 9, date: "2025-01-20", channel: "Online - WhatsApp", order_id: "ORD-20250120-3250", product: "Pakan Ayam 5kg", category: "Feed", quantity: 19, price_per_unit: 153065, total_price: 2908235, customer_name: "Customer 144", city: "Bekasi", payment_method: "Transfer", sales_rep: "Sari" },
  { id: 10, date: "2024-02-29", channel: "Online - Website", order_id: "ORD-20240229-1623", product: "Gula 1kg", category: "Retail", quantity: 10, price_per_unit: 35619, total_price: 356190, customer_name: "Customer 77", city: "Cirebon", payment_method: "E-Wallet", sales_rep: "Rudi" },
];

export default function App() {
  const [data, setData] = useState<SalesData[]>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [gasUrl, setGasUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'transactions' | 'sales' | 'settings'>('dashboard');

  const fetchData = async () => {
    if (!gasUrl) return;
    setLoading(true);
    try {
      const response = await fetch(gasUrl);
      const result = await response.json();
      if (Array.isArray(result)) {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please check your Google Apps Script URL and deployment settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Database className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-900">SalesFlow</span>
          </div>
          
          <nav className="space-y-2">
            <NavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Dashboard" 
              active={currentView === 'dashboard'} 
              onClick={() => setCurrentView('dashboard')}
            />
            <NavItem 
              icon={<ShoppingCart className="w-4 h-4" />} 
              label="Transactions" 
              active={currentView === 'transactions'} 
              onClick={() => setCurrentView('transactions')}
            />
            <NavItem 
              icon={<Users className="w-4 h-4" />} 
              label="Sales Reps" 
              active={currentView === 'sales'} 
              onClick={() => setCurrentView('sales')}
            />
            <NavItem icon={<Bell className="w-4 h-4" />} label="Notifications" />
            <NavItem 
              icon={<Settings className="w-4 h-4" />} 
              label="Settings" 
              active={currentView === 'settings'} 
              onClick={() => setCurrentView('settings')} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Connected</span>
            </div>
          </div>
          <NavItem icon={<HelpCircle className="w-4 h-4" />} label="Support Center" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search analytics, orders, or customers..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden ring-1 ring-slate-200">
              <img src="https://picsum.photos/seed/user/40/40" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {currentView === 'dashboard' ? 'Sales Performance' : currentView === 'sales' ? 'Sales Representative Performance' : currentView === 'settings' ? 'System Settings' : 'Transaction History'}
                </h1>
                <p className="text-slate-500">
                  {currentView === 'dashboard' 
                    ? 'Real-time overview of your business metrics' 
                    : currentView === 'sales'
                    ? 'Employee performance and sales contribution'
                    : currentView === 'settings'
                    ? 'Configure data sources and system preferences'
                    : 'Detailed record of all sales activities'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>

            {currentView === 'settings' && (
              <div className="mb-8 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Google Sheets Connection</h3>
                    <p className="text-xs text-slate-500">Sync your dashboard with real-time data from Google Sheets</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Web App URL</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={gasUrl}
                        onChange={(e) => setGasUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button 
                        onClick={fetchData}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex gap-3">
                      <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <p className="font-bold mb-1 uppercase tracking-tight">How to connect:</p>
                        <ol className="list-decimal ml-4 space-y-1">
                          <li>Open your Google Sheet with sales data.</li>
                          <li>Go to <strong>Extensions &gt; Apps Script</strong>.</li>
                          <li>Paste the integration script and click <strong>Deploy &gt; New Deployment</strong>.</li>
                          <li>Select <strong>Web App</strong>, set access to <strong>Anyone</strong>, and copy the URL here.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView !== 'settings' && (
              <Dashboard data={data} loading={loading} initialView={currentView} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active 
          ? "bg-indigo-50 text-indigo-600" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
