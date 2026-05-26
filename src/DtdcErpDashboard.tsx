import React, { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Package, MapPin, Truck, Users, Tag, BarChart3, Settings,
  Bell, Moon, Sun, Menu, X, Search, ChevronDown, ChevronRight, ChevronLeft,
  Plus, Filter, Download, Eye, Edit, Trash2, Check, AlertCircle, Clock,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, Upload, Printer, RefreshCw, LogOut, User, HelpCircle,
  Phone, Mail, MapPin as MapPinIcon, Calendar, Hash, Weight, Layers, ShieldAlert,
  Navigation, Star, Award, FileText
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Barcode from 'react-barcode'
import { useReactToPrint } from 'react-to-print'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

type ActivePage = 'dashboard' | 'booking' | 'tracking' | 'delivery' | 'customers' | 'sticker' | 'reports' | 'settings'

interface CustomerRecord {
  id: string
  name: string
  email: string
  phone: string
  city: string
  totalShipments: number
  totalSpent: number
  status: 'Active' | 'Inactive'
  joinDate: string
}

const revenueData = [
  { month: 'Jan', revenue: 42000, expenses: 28000 },
  { month: 'Feb', revenue: 53000, expenses: 31000 },
  { month: 'Mar', revenue: 48000, expenses: 29000 },
  { month: 'Apr', revenue: 61000, expenses: 34000 },
  { month: 'May', revenue: 55000, expenses: 30000 },
  { month: 'Jun', revenue: 67000, expenses: 38000 },
  { month: 'Jul', revenue: 72000, expenses: 41000 },
  { month: 'Aug', revenue: 69000, expenses: 39000 },
  { month: 'Sep', revenue: 78000, expenses: 44000 },
  { month: 'Oct', revenue: 84000, expenses: 47000 },
  { month: 'Nov', revenue: 91000, expenses: 51000 },
  { month: 'Dec', revenue: 98000, expenses: 55000 },
]

const deliveryStatusData = [
  { name: 'Delivered', value: 4821, color: '#22c55e' },
  { name: 'In Transit', value: 1243, color: '#00d4ff' },
  { name: 'Pending', value: 532, color: '#f59e0b' },
  { name: 'Failed', value: 187, color: '#ff3b30' },
]

const weeklyData = [
  { day: 'Mon', bookings: 120, deliveries: 98 },
  { day: 'Tue', bookings: 145, deliveries: 115 },
  { day: 'Wed', bookings: 132, deliveries: 121 },
  { day: 'Thu', bookings: 168, deliveries: 143 },
  { day: 'Fri', bookings: 189, deliveries: 162 },
  { day: 'Sat', bookings: 97, deliveries: 88 },
  { day: 'Sun', bookings: 54, deliveries: 49 },
]

const recentBookings = [
  { id: 'DT2024001', customer: 'Rajesh Kumar', from: 'Mumbai', to: 'Delhi', weight: '2.5 kg', status: 'In Transit', amount: 450, date: '2024-01-15' },
  { id: 'DT2024002', customer: 'Priya Sharma', from: 'Bangalore', to: 'Chennai', weight: '1.2 kg', status: 'Delivered', amount: 280, date: '2024-01-15' },
  { id: 'DT2024003', customer: 'Amit Patel', from: 'Ahmedabad', to: 'Pune', weight: '5.0 kg', status: 'Pending', amount: 620, date: '2024-01-14' },
  { id: 'DT2024004', customer: 'Sunita Verma', from: 'Kolkata', to: 'Hyderabad', weight: '3.8 kg', status: 'Failed', amount: 530, date: '2024-01-14' },
  { id: 'DT2024005', customer: 'Vikram Singh', from: 'Jaipur', to: 'Mumbai', weight: '0.8 kg', status: 'Delivered', amount: 195, date: '2024-01-13' },
]

const initialCustomers: CustomerRecord[] = [
  { id: 'C001', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', city: 'Mumbai', totalShipments: 47, totalSpent: 12450, status: 'Active', joinDate: '2023-03-15' },
  { id: 'C002', name: 'Priya Sharma', email: 'priya@example.com', phone: '9765432109', city: 'Delhi', totalShipments: 23, totalSpent: 6780, status: 'Active', joinDate: '2023-05-22' },
  { id: 'C003', name: 'Amit Patel', email: 'amit@example.com', phone: '9654321098', city: 'Ahmedabad', totalShipments: 89, totalSpent: 24300, status: 'Active', joinDate: '2022-11-10' },
  { id: 'C004', name: 'Sunita Verma', email: 'sunita@example.com', phone: '9543210987', city: 'Bangalore', totalShipments: 12, totalSpent: 3200, status: 'Inactive', joinDate: '2023-08-01' },
  { id: 'C005', name: 'Vikram Singh', email: 'vikram@example.com', phone: '9432109876', city: 'Jaipur', totalShipments: 56, totalSpent: 15670, status: 'Active', joinDate: '2023-01-20' },
]

const deliveryList = [
  { id: 'DT2024001', customer: 'Rajesh Kumar', address: '45 MG Road, Mumbai 400001', phone: '9876543210', agent: 'Suresh D.', status: 'In Transit', eta: '2:30 PM', attempts: 0 },
  { id: 'DT2024006', customer: 'Anita Joshi', address: '12 Park Street, Kolkata 700016', phone: '8844557744', agent: 'Mohan K.', status: 'Out for Delivery', eta: '11:00 AM', attempts: 0 },
  { id: 'DT2024009', customer: 'Deepak Rao', address: '78 Anna Salai, Chennai 600002', phone: '7733221100', agent: 'Ravi P.', status: 'Delivered', eta: 'Done', attempts: 1 },
  { id: 'DT2024012', customer: 'Meena Pillai', address: '23 Banjara Hills, Hyderabad 500034', phone: '9988776655', agent: 'Arun S.', status: 'Failed', eta: 'Reschedule', attempts: 2 },
  { id: 'DT2024015', customer: 'Sanjay Gupta', address: '56 Connaught Place, Delhi 110001', phone: '9112233445', agent: 'Vinod M.', status: 'Pending', eta: '4:00 PM', attempts: 0 },
]

const notifications = [
  { id: 1, text: 'New booking DT2024020 received', time: '2 min ago', read: false },
  { id: 2, text: 'Delivery DT2024009 completed successfully', time: '15 min ago', read: false },
  { id: 3, text: 'Agent Suresh D. checked in', time: '1 hr ago', read: true },
  { id: 4, text: 'Payment received for DT2024003', time: '2 hr ago', read: true },
]

const vehiclesData = [
  { id: 'V-201', route: 'Mumbai → Pune', driver: 'Vijay Shinde', speed: '72 km/h', fuel: '84%', status: 'On Route', coordinates: '18.97, 73.02' },
  { id: 'V-208', route: 'Delhi → Jaipur', driver: 'Ramesh Pal', speed: '65 km/h', fuel: '45%', status: 'On Route', coordinates: '27.42, 76.51' },
  { id: 'V-312', route: 'Bangalore → Chennai', driver: 'K. Srinivasan', speed: '0 km/h', fuel: '92%', status: 'Loading', coordinates: '12.97, 77.59' },
  { id: 'V-104', route: 'Kolkata → Patna', driver: 'Sunil Shaw', speed: '58 km/h', fuel: '18%', status: 'Refueling', coordinates: '23.82, 86.44' },
]

const failedDeliveriesBreakdown = [
  { reason: 'Recipient Not Available', count: 82, percentage: 44, color: 'bg-primary-red' },
  { reason: 'Incorrect Address details', count: 48, percentage: 26, color: 'bg-yellow-500' },
  { reason: 'Refused by Consignee', count: 32, percentage: 17, color: 'bg-orange-500' },
  { reason: 'Payment Pending (COD)', count: 25, percentage: 13, color: 'bg-accent-cyan' },
]

const zonePerformance = [
  { name: 'West Zone (HQ)', bookings: '2,842', transitTime: '18.2 hrs', efficiency: 94, color: '#ff3b30' },
  { name: 'North Zone', bookings: '1,532', transitTime: '22.5 hrs', efficiency: 88, color: '#00d4ff' },
  { name: 'South Zone', bookings: '1,721', transitTime: '19.4 hrs', efficiency: 91, color: '#22c55e' },
  { name: 'East Zone', bookings: '688', transitTime: '26.8 hrs', efficiency: 82, color: '#f59e0b' },
]

const driverActivity = [
  { name: 'Amit Mishra', trips: 14, rating: 4.8, status: 'Active', load: 85 },
  { name: 'Sartaj Khan', trips: 11, rating: 4.9, status: 'Active', load: 92 },
  { name: 'Mohit Sharma', trips: 8, rating: 4.5, status: 'Idle', load: 0 },
  { name: 'Gurpreet Singh', trips: 12, rating: 4.7, status: 'Active', load: 68 },
]

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    'In Transit': 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
    'Delivered': 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40',
    'Pending': 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800/40',
    'Failed': 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40',
    'Out for Delivery': 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40',
    'Active': 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40',
    'Inactive': 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700/50',
  }
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider', statusColors[status] ?? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400')}>
      {status}
    </span>
  )
}

function StatCard({ title, value, change, icon: Icon, color, percent }: { title: string; value: string; change: string; icon: any; color: string; percent: number }) {
  const positive = change.startsWith('+')
  return (
    <div className="glass-panel hover:border-white/20 hover:shadow-neon-cyan hover:scale-[1.02] p-5 rounded-2xl relative overflow-hidden group">
      {/* Decorative gradient overlay */}
      <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-20", color)} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-gray-900 dark:text-white group-hover:scale-110 transition-transform')}>
          <Icon size={22} className={cn(color === 'bg-blue-500' ? 'text-accent-cyan' : color === 'bg-purple-500' ? 'text-purple-400' : color === 'bg-green-500' ? 'text-green-400' : 'text-primary-red')} />
        </div>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-white/5 border', positive ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20')}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </span>
      </div>
      
      <div className="space-y-1 relative z-10">
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      </div>

      {/* Modern thin neon loading indicator at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-white/10 rounded-xl shadow-glass text-xs">
        <p className="font-bold text-gray-700 dark:text-gray-300 mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-4 justify-between py-0.5">
            <span className="flex items-center gap-1.5 font-medium text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header section with live indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            Logistics Command Center
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 pulsing-dot"></span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">Real-time terminal operations, shipping indices, and network performance.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
            <RefreshCw size={12} /> Sync Logs
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₹9,82,450" change="+12.5%" icon={DollarSign} color="bg-blue-500" percent={82} />
        <StatCard title="Active Bookings" value="6,783" change="+8.2%" icon={ShoppingBag} color="bg-purple-500" percent={68} />
        <StatCard title="Delivered AWB" value="4,821" change="+15.3%" icon={CheckCircle} color="bg-green-500" percent={91} />
        <StatCard title="Failed Deliveries" value="187" change="-3.1%" icon={XCircle} color="bg-red-500" percent={22} />
      </div>

      {/* Main Analytics: Revenue trends + Delivery status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue AreaChart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">Revenue vs Operational Expenses</h2>
              <p className="text-xs text-gray-400">Monthly financial performance breakdown</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-red" /> Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={revenueData} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#00d4ff" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#ff3b30" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Status Donut Chart */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">Delivery Index</h2>
            <p className="text-xs text-gray-400 mb-4">Volume breakdown of active manifests</p>
          </div>
          <div className="relative flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deliveryStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={72} paddingAngle={3} dataKey="value">
                  {deliveryStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => v?.toLocaleString() ?? ''} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white">6,783</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Shipments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {deliveryStatusData.map(d => (
              <div key={d.name} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-400 truncate">{d.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white pl-1">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Telemetry (Vehicle Movement) & COD Collection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Movement telemetry */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Navigation size={18} className="text-accent-cyan animate-pulse" />
                Live Fleet Telemetry
              </h2>
              <p className="text-xs text-gray-400">Real-time GPS tracking of active transit trucks</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan tracking-wider uppercase">
              GPS Sync Active
            </span>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {vehiclesData.map(v => (
              <div key={v.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Truck size={16} className={v.status === 'On Route' ? 'text-accent-cyan' : 'text-gray-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white font-mono">{v.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-white/5 border border-white/5 text-gray-300">{v.status}</span>
                    </div>
                    <p className="text-gray-400 font-semibold mt-0.5">{v.route} <span className="text-[10px] text-gray-500 font-mono">({v.coordinates})</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{v.driver}</p>
                  <p className="text-gray-400 font-medium text-[10px] mt-0.5">Speed: <span className="font-mono text-accent-cyan">{v.speed}</span> · Fuel: <span className="font-mono text-gray-900 dark:text-white">{v.fuel}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COD Collection */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">COD Liquidity Ledger</h2>
            <p className="text-xs text-gray-400">Cash On Delivery collection logs</p>
          </div>
          <div className="space-y-4 my-3">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total COD Pending</p>
              <p className="text-3xl font-extrabold text-accent-cyan tracking-tight mt-1">₹5,42,120</p>
              <p className="text-[10px] text-green-400 font-bold mt-1.5 flex items-center justify-center gap-1">
                <TrendingDown size={11} /> -5.2% than yesterday
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Collected Today</span>
                <span className="font-bold text-gray-900 dark:text-white">₹3,84,200</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent-cyan" style={{ width: '70%' }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Disbursed to Merchants</span>
                <span className="font-bold text-gray-900 dark:text-white">₹2,95,000</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '55%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Failed Deliveries & Zone Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Deliveries breakdown */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <ShieldAlert size={18} className="text-primary-red" />
                NDR Exception Analysis
              </h2>
              <p className="text-xs text-gray-400">Failed delivery classification logs</p>
            </div>
            <span className="text-xs font-bold text-primary-red bg-primary-red/10 border border-primary-red/20 px-2.5 py-0.5 rounded-full">
              187 Incidents
            </span>
          </div>
          <div className="space-y-4 my-2">
            {failedDeliveriesBreakdown.map(fd => (
              <div key={fd.reason} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-bold">{fd.reason}</span>
                  <span className="text-gray-400 font-semibold">{fd.count} cases ({fd.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", fd.color)} style={{ width: `${fd.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Performance */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Award size={18} className="text-green-400" />
                Regional Node Performance
              </h2>
              <p className="text-xs text-gray-400">Operational indices across major hubs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {zonePerformance.map(z => (
              <div key={z.name} className="p-3 bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded-xl relative group">
                <div className="absolute right-3 top-3 w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-xs font-black text-gray-900 dark:text-white font-mono bg-white/5 group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/20">
                  {z.efficiency}%
                </div>
                <p className="text-xs font-extrabold text-gray-900 dark:text-white">{z.name}</p>
                <div className="mt-3 space-y-1 text-[11px]">
                  <p className="text-gray-400 font-medium">AWB Vol: <span className="font-bold text-gray-900 dark:text-white">{z.bookings}</span></p>
                  <p className="text-gray-400 font-medium">Avg Transit: <span className="font-bold text-accent-cyan font-mono">{z.transitTime}</span></p>
                </div>
                <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${z.efficiency}%`, backgroundColor: z.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Activity & Recent Shipments Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Activity */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">Active Delivery Agents</h2>
            <p className="text-xs text-gray-400 mb-4">Roster performance rating indexes</p>
          </div>
          <div className="space-y-3">
            {driverActivity.map(d => (
              <div key={d.name} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{d.name}</span>
                    <span className={cn("w-1.5 h-1.5 rounded-full pulsing-dot", d.status === 'Active' ? 'bg-green-400 text-green-400' : 'bg-gray-500 text-gray-500')} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{d.trips} completed trips · Load: <span className="font-mono text-gray-900 dark:text-white font-bold">{d.load}%</span></p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-bold font-mono">
                  <Star size={11} fill="currentColor" /> {d.rating}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Shipments timeline */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white tracking-tight">Recent Manifest Milestones</h2>
              <p className="text-xs text-gray-400">Chronological list of shipment bookings</p>
            </div>
            <button className="text-xs font-bold text-accent-cyan hover:underline flex items-center gap-1">
              Command Logs <ChevronRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="py-2.5 px-3">AWB No.</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-accent-cyan">{b.id}</td>
                    <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{b.customer}</td>
                    <td className="py-3 px-3 text-gray-300 font-semibold">{b.from} → {b.to}</td>
                    <td className="py-3 px-3 text-gray-400 font-medium">{b.weight}</td>
                    <td className="py-3 px-3"><StatusBadge status={b.status} /></td>
                    <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white text-right">{formatCurrency(b.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    senderName: '', senderPhone: '', senderAddress: '', senderCity: '', senderPin: '',
    receiverName: '', receiverPhone: '', receiverAddress: '', receiverCity: '', receiverPin: '',
    weight: '', dimensions: '', serviceType: 'Express', paymentMode: 'Prepaid', description: '',
    insurance: false, fragile: false,
  })
  const [otpModal, setOtpModal] = useState(false)
  const [otp, setOtp] = useState(['', '', '', ''])
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const [booked, setBooked] = useState(false)

  const updateForm = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }))

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 3) otpRefs[i + 1].current?.focus()
  }

  const confirmOtp = () => {
    setOtpModal(false)
    setBooked(true)
  }

  if (booked) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-950/30 border border-green-500/30 flex items-center justify-center">
        <CheckCircle size={40} className="text-green-400" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Booking Dispatch Successful!</h2>
        <p className="text-gray-400 mt-2 font-medium">Your parcel manifest has been synced and uploaded to the central ledger.</p>
        <p className="text-accent-cyan font-mono font-black text-xl mt-3 tracking-widest uppercase">DT{Date.now().toString().slice(-7)}</p>
      </div>
      <button onClick={() => { setBooked(false); setStep(1); setForm({ senderName: '', senderPhone: '', senderAddress: '', senderCity: '', senderPin: '', receiverName: '', receiverPhone: '', receiverAddress: '', receiverCity: '', receiverPin: '', weight: '', dimensions: '', serviceType: 'Express', paymentMode: 'Prepaid', description: '', insurance: false, fragile: false }) }}
        className="px-6 py-2.5 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.03] transition-all text-gray-900 dark:text-white rounded-xl font-bold shadow-neon-red">
        Book Another Parcel
      </button>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">New Consignment Manifest</h1>
        <p className="text-gray-400 text-sm mt-0.5">Register a cargo booking into the Desk To Desk express router.</p>
      </div>

      {/* Modern Glowing Stepper */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl overflow-x-auto">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-3 flex-shrink-0">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all border',
              step > s ? 'bg-green-500 border-green-400 text-gray-900 dark:text-white' : step === s ? 'bg-primary-red border-red-500 text-gray-900 dark:text-white shadow-neon-red' : 'bg-white/5 border-white/10 text-gray-400')}>
              {step > s ? <Check size={16} /> : s}
            </div>
            <span className={cn('text-xs font-bold uppercase tracking-wider', step === s ? 'text-gray-900 dark:text-white' : 'text-gray-500')}>
              {['Sender Registry', 'Package Spec', 'Ledger Preview'][s - 1]}
            </span>
            {s < 3 && <ChevronRight size={14} className="text-gray-600" />}
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-2xl relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider border-b border-white/5 pb-2">Sender Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'senderName', placeholder: 'Rajesh Kumar' },
                  { label: 'Phone Number', key: 'senderPhone', placeholder: '9876543210' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input value={form[f.key as keyof typeof form] as string} onChange={e => updateForm(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Address</label>
                  <textarea value={form.senderAddress} onChange={e => updateForm('senderAddress', e.target.value)} rows={2}
                    placeholder="Full corporate or residential pickup address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all resize-none" />
                </div>
                {[
                  { label: 'City', key: 'senderCity', placeholder: 'Mumbai' },
                  { label: 'PIN Code', key: 'senderPin', placeholder: '400001' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input value={form[f.key as keyof typeof form] as string} onChange={e => updateForm(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-3">
                <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.03] text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-neon-red">
                  Proceed Spec <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider border-b border-white/5 pb-2">Receiver Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'receiverName', placeholder: 'Priya Sharma' },
                    { label: 'Phone Number', key: 'receiverPhone', placeholder: '9765432109' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input value={form[f.key as keyof typeof form] as string} onChange={e => updateForm(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Address</label>
                    <textarea value={form.receiverAddress} onChange={e => updateForm('receiverAddress', e.target.value)} rows={2}
                      placeholder="Destination address details"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all resize-none" />
                  </div>
                  {[
                    { label: 'City', key: 'receiverCity', placeholder: 'Delhi' },
                    { label: 'PIN Code', key: 'receiverPin', placeholder: '110001' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input value={form[f.key as keyof typeof form] as string} onChange={e => updateForm(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider border-b border-white/5 pb-2">Package specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                    <input value={form.weight} onChange={e => updateForm('weight', e.target.value)} placeholder="2.5"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Dimensions (L×W×H cm)</label>
                    <input value={form.dimensions} onChange={e => updateForm('dimensions', e.target.value)} placeholder="30×20×15"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service Type</label>
                    <select value={form.serviceType} onChange={e => updateForm('serviceType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red transition-all">
                      <option>Express</option>
                      <option>Standard</option>
                      <option>Economy</option>
                      <option>Same Day</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Mode</label>
                    <select value={form.paymentMode} onChange={e => updateForm('paymentMode', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red transition-all">
                      <option>Prepaid</option>
                      <option>COD</option>
                      <option>To Pay</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-6 pt-2">
                  {[{ key: 'insurance', label: 'Transit Insurance Coverage' }, { key: 'fragile', label: 'Fragile handling spec' }].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form[opt.key as keyof typeof form] as boolean} onChange={e => updateForm(opt.key, e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-red focus:ring-primary-red" />
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/5">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-2">
                  <ArrowLeft size={14} /> Sender Info
                </button>
                <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.03] text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-neon-red">
                  Generate Summary <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider border-b border-white/5 pb-2">Consignment Manifest Audit</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Sender Spec', items: [{ label: 'Name', value: form.senderName || '—' }, { label: 'Phone', value: form.senderPhone || '—' }, { label: 'Route Hub', value: form.senderCity || '—' }] },
                  { title: 'Consignee Spec', items: [{ label: 'Name', value: form.receiverName || '—' }, { label: 'Phone', value: form.receiverPhone || '—' }, { label: 'Destination Hub', value: form.receiverCity || '—' }] },
                ].map(section => (
                  <div key={section.title} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                    <p className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">{section.title}</p>
                    {section.items.map(item => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-gray-400 font-semibold">{item.label}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                <p className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Cargo specification details & Estimates</p>
                {[
                  { label: 'Weight', value: form.weight ? `${form.weight} kg` : '—' },
                  { label: 'Service Level', value: form.serviceType },
                  { label: 'Payment Ledger', value: form.paymentMode },
                  { label: 'Insurance cover', value: form.insurance ? 'Full Coverage' : 'None' },
                  { label: 'Fragile marking', value: form.fragile ? 'Active' : 'No' },
                  { label: 'Estimated Transit Fare', value: '₹450' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs border-b border-white/5 last:border-0 py-1.5 last:pb-0">
                    <span className="text-gray-400 font-semibold">{item.label}</span>
                    <span className={cn('font-bold', item.label === 'Estimated Transit Fare' ? 'text-accent-cyan text-sm font-black font-mono' : 'text-gray-900 dark:text-white')}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-3 border-t border-white/5">
                <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-2">
                  <ArrowLeft size={14} /> Package specs
                </button>
                <button onClick={() => setOtpModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.03] text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-500/20">
                  <Check size={14} /> Sign Manifest (OTP)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {otpModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 w-full max-w-sm rounded-2xl border border-white/10 shadow-glass">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">Ledger OTP Sign-off</h3>
              <p className="text-xs text-gray-400 mb-6 font-medium">Verify cargo routing details. Enter OTP sent to {form.senderPhone || '98XXXXXX10'}</p>
              <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input key={i} ref={otpRefs[i]} value={digit} onChange={e => handleOtpChange(i, e.target.value)}
                    maxLength={1} className="w-12 h-12 text-center text-xl font-bold border border-white/10 rounded-xl bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan" />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setOtpModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={confirmOtp} className="flex-1 py-2.5 bg-gradient-to-r from-primary-red to-red-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-neon-red hover:scale-[1.02] transition-all">
                  Authenticate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TrackingPage() {
  const [trackId, setTrackId] = useState('')
  const [result, setResult] = useState<null | 'found' | 'notfound'>(null)

  const trackingSteps = [
    { label: 'Manifest Registered', time: '15 Jan, 10:30 AM', location: 'Mumbai HQ Terminal', done: true },
    { label: 'Outbound Loaded', time: '15 Jan, 2:15 PM', location: 'Mumbai Main Hub', done: true },
    { label: 'In Transit Route', time: '16 Jan, 8:00 AM', location: 'Nagpur Transit Terminal', done: true },
    { label: 'Out for Hub Delivery', time: 'Expected Today', location: 'Delhi Okhla Hub', done: false },
    { label: 'Consignee Handover', time: 'Pending', location: '—', done: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">AWB Telemetry Tracker</h1>
        <p className="text-gray-400 text-sm mt-0.5">Audit cargo coordinates and waypoint histories.</p>
      </div>

      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={trackId} onChange={e => setTrackId(e.target.value)} placeholder="Enter tracking ID or AWB Code (e.g. DT2024001)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all" />
          </div>
          <button onClick={() => setResult(trackId.trim() ? 'found' : 'notfound')}
            className="px-5 py-2.5 bg-gradient-to-r from-accent-cyan to-cyan-500 text-slate-900 rounded-xl text-xs font-bold hover:scale-[1.03] transition-all shadow-neon-cyan">
            Track Cargo
          </button>
        </div>
      </div>

      {result === 'notfound' && (
        <div className="bg-red-950/20 border border-red-800/30 rounded-2xl p-5 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs font-bold">No active manifest matching this key was logged. Please cross-audit AWB code.</p>
        </div>
      )}

      {result === 'found' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Active Manifest AWB</p>
                <p className="font-mono font-black text-accent-cyan text-lg mt-0.5 tracking-wider">{trackId}</p>
              </div>
              <StatusBadge status="In Transit" />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8 text-xs">
              <div><p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Route Origin</p><p className="font-extrabold text-gray-900 dark:text-white mt-0.5">Mumbai HQ</p></div>
              <div><p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Destination Hub</p><p className="font-extrabold text-gray-900 dark:text-white mt-0.5">Delhi Terminal</p></div>
              <div><p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">ETA Target</p><p className="font-extrabold text-accent-cyan font-mono mt-0.5">17 Jan 2024</p></div>
            </div>
            
            {/* Interactive Glowing Timeline */}
            <div className="space-y-0 pl-1">
              {trackingSteps.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border',
                      step.done ? 'bg-green-500 border-green-400 text-gray-900 dark:text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 text-gray-500')}>
                      {step.done ? <Check size={14} className="text-gray-900 dark:text-white" /> : <Clock size={14} className="text-gray-500" />}
                    </div>
                    {i < trackingSteps.length - 1 && <div className={cn('w-0.5 h-12 mt-1', step.done ? 'bg-green-500' : 'bg-white/5')} />}
                  </div>
                  <div className="pb-6">
                    <p className={cn('font-bold text-xs uppercase tracking-wide', step.done ? 'text-gray-900 dark:text-white' : 'text-gray-500')}>{step.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{step.time} · {step.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Access Grid */}
      <div className="glass-panel p-5 rounded-2xl">
        <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider border-b border-white/5 pb-2 mb-4">Live Manifest Pipelines</h2>
        <div className="space-y-3">
          {recentBookings.filter(b => b.status === 'In Transit' || b.status === 'Pending').map(b => (
            <div key={b.id} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
              <div>
                <p className="font-mono text-xs font-bold text-accent-cyan tracking-wider">{b.id}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{b.customer} · {b.from} → {b.to}</p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={b.status} />
                <button onClick={() => { setTrackId(b.id); setResult('found') }} className="text-xs font-bold text-accent-cyan hover:underline">Track AWB</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DeliveryPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [drsModal, setDrsModal] = useState(false)
  const [drsNo, setDrsNo] = useState('12345')
  const [branch, setBranch] = useState('DTD')
  const [worker, setWorker] = useState('KHILAN SINGH THAKUR')
  const drsRef = useRef<HTMLDivElement>(null)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const selectAll = () => {
    setSelectedIds(selectedIds.length === deliveryList.length ? [] : deliveryList.map(d => d.id))
  }

  // Generate A4 PDF — renders in a clean light-mode iframe to avoid dark mode bleed
  const generateDrsPdf = useCallback(async (_mode: 'save' | 'print') => {
    if (!drsRef.current) return

    // 1. Create hidden iframe with clean white background (no dark class)
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;border:none;visibility:hidden'
    document.body.appendChild(iframe)
    const iDoc = iframe.contentDocument!
    const iWin = iframe.contentWindow!

    // 2. Copy all stylesheets into iframe
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    const stylesHtml = styleLinks.map(s => s.outerHTML).join('\n')

    // 3. Inject content — no dark class on html, force light mode
    iDoc.open()
    iDoc.write(`<!DOCTYPE html><html style="color-scheme:light;background:#fff"><head>
      ${stylesHtml}
      <style>
        body { margin:0; padding:0; background:#fff; color:#000; }
        * { color:#000 !important; }
        svg text, svg tspan { fill:#000 !important; }
        table, td, th { border-color:#000 !important; background:#fff !important; }
      </style>
    </head><body style="background:#fff">${drsRef.current.outerHTML}</body></html>`)
    iDoc.close()

    // 4. Wait for fonts + SVG barcodes to render
    await new Promise(r => setTimeout(r, 500))

    // 5. Capture
    const captureEl = iDoc.body.firstElementChild as HTMLElement
    const canvas = await html2canvas(captureEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      width: 794,
      windowWidth: 794,
      logging: false,
    })
    document.body.removeChild(iframe)

    // 6. Build A4 PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', [210, 297])
    const margin = 5
    const usableW = 200
    const usableH = 287
    const imgW = usableW
    const imgH = (canvas.height / canvas.width) * imgW
    if (imgH <= usableH) {
      pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH)
    } else {
      const totalPages = Math.ceil(imgH / usableH)
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', margin, margin - i * usableH, imgW, imgH)
      }
    }
    pdf.save(`DRS_${drsNo}.pdf`)
  }, [drsRef, drsNo])

  const handleDownloadDRS = () => generateDrsPdf('save')
  const handlePrintDRS = () => generateDrsPdf('print')

  const selectedDeliveries = deliveryList.filter(d => selectedIds.includes(d.id))
  const now = new Date()
  const dateStr = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}.${now.getMinutes().toString().padStart(2,'0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Hub Manifest Delivery Queue</h1>
          <p className="text-gray-400 text-sm mt-0.5">Route mapping and manifest allocations.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
            <RefreshCw size={12} /> Sync Manifest
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setDrsModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.02] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-neon-red"
            >
              <FileText size={12} /> Generate DRS ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Today', value: '243', color: 'text-accent-cyan', icon: Package },
          { label: 'Handed Over', value: '189', color: 'text-green-400', icon: CheckCircle },
          { label: 'Outward Manifest', value: '42', color: 'text-purple-400', icon: Truck },
          { label: 'Exception Hold', value: '12', color: 'text-primary-red', icon: XCircle },
        ].map(s => (
          <div key={s.label} className="glass-panel p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</span>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest">Active Dispatch Manifest Queue</h2>
            {selectedIds.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-red/10 border border-primary-red/20 text-primary-red">
                {selectedIds.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="flex items-center gap-1.5 text-xs text-gray-300 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all font-bold">
              <Check size={12} /> {selectedIds.length === deliveryList.length ? 'Deselect All' : 'Select All'}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-300 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all font-bold">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {deliveryList.map(d => (
            <div key={d.id}
              onClick={() => toggleSelect(d.id)}
              className={cn('p-5 flex flex-wrap items-center gap-4 transition-colors cursor-pointer',
                selectedIds.includes(d.id) ? 'bg-primary-red/5 border-l-2 border-primary-red' : 'hover:bg-white/[0.01]'
              )}>
              {/* Checkbox */}
              <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                selectedIds.includes(d.id) ? 'bg-primary-red border-primary-red' : 'border-white/20 bg-white/5')}>
                {selectedIds.includes(d.id) && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-accent-cyan tracking-wider">{d.id}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{d.customer}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.address}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-gray-900 dark:text-white font-bold">{d.agent}</p>
                <p className="text-gray-400 font-semibold mt-0.5">ETA: <span className="font-mono text-accent-cyan">{d.eta}</span></p>
                {d.attempts > 0 && <span className="text-[10px] font-bold text-primary-red bg-primary-red/10 border border-primary-red/20 px-2 py-0.5 rounded mt-1.5 inline-block">{d.attempts} exceptions</span>}
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Eye size={14} /></button>
                <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Phone size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DRS Modal */}
      <AnimatePresence>
        {drsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="glass-panel w-full max-w-4xl max-h-[90vh] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText size={18} className="text-accent-cyan" /> Delivery Run Sheet (DRS)
                </h3>
                <button onClick={() => setDrsModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* DRS Config */}
              <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'DRS Number', value: drsNo, set: setDrsNo },
                    { label: 'Branch', value: branch, set: setBranch },
                    { label: 'Worker Name', value: worker, set: setWorker },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.label}</label>
                      <input value={f.value} onChange={e => f.set(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* DRS Preview — scrollable */}
              <div className="overflow-y-auto flex-1 p-4">
                <div ref={drsRef} className="drs-print-area" style={{ background: '#ffffff', padding: '4mm 5mm', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', WebkitPrintColorAdjust: 'exact', colorScheme: 'light' } as React.CSSProperties}>
                  {/* eslint-disable-next-line react/no-danger */}
                  <style dangerouslySetInnerHTML={{ __html: `.drs-print-area, .drs-print-area *, .drs-print-area td, .drs-print-area th, .drs-print-area div, .drs-print-area span { color: #000000 !important; } .drs-print-area svg text, .drs-print-area svg tspan { fill: #000000 !important; }` }} />

                  {/* ── Header: 3-col grid — logo | title center | date/branch/worker ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '12px', marginBottom: '5mm' }}>
                    {/* Col 1: logo */}
                    <img
                      src="/dtdc-logo-transparent.png"
                      alt="DTDC"
                      style={{ width: '240px', height: '90px', objectFit: 'contain', display: 'block' }}
                    />
                    {/* Col 2: title centered */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '26px', fontWeight: 700, color: '#000', whiteSpace: 'nowrap' }}>
                        Delivery Run Sheet
                      </span>
                    </div>
                    {/* Col 3: date/branch/worker — all left-aligned from same start point */}
                    <div style={{ textAlign: 'left', fontSize: '11px', lineHeight: '1.9', color: '#000' }}>
                      <div style={{ fontWeight: 700 }}>{dateStr}</div>
                      <div style={{ fontWeight: 700 }}>Branch - {branch}</div>
                      <div style={{ fontWeight: 700 }}>Worker - {worker}</div>
                    </div>
                  </div>

                  {/* ── Table ── */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '6%' }} />
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '16%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {['SNo', 'PCs', 'Consignee', 'AWB', 'Receiver', 'Remarks'].map(h => (
                          <th key={h} style={{
                            border: '1px solid #000',
                            padding: '5px 4px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 700,
                            fontSize: '11px',
                            color: '#000',
                            background: '#fff',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDeliveries.map((d, i) => (
                        <tr key={d.id}>
                          {/* SNo */}
                          <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'left', verticalAlign: 'middle', fontWeight: 700, fontSize: '13px', color: '#000' }}>{i + 1}</td>
                          {/* PCs */}
                          <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', fontSize: '12px', color: '#000' }}>1</td>
                          {/* Consignee: city top-center, phone middle, AWB id bottom — exactly like PDF */}
                          <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', textAlign: 'center', color: '#000', height: '85px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 400, color: '#000' }}>
                                {d.address.split(',').slice(-2)[0].trim().replace(/\d+/g, '').trim().toUpperCase()}
                              </div>
                              <div style={{ fontSize: '10px', color: '#000' }}>{d.phone}</div>
                              <div style={{ fontSize: '10px', color: '#000' }}>{d.id}</div>
                            </div>
                          </td>
                          {/* AWB barcode — tall narrow, centered */}
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Barcode
                                value={d.id}
                                format="CODE128"
                                width={1.5}
                                height={75}
                                displayValue={true}
                                fontSize={13}
                                fontOptions=""
                                margin={2}
                                background="#ffffff"
                                lineColor="#000000"
                              />
                            </div>
                          </td>
                          {/* Receiver */}
                          <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', color: '#000' }}></td>
                          {/* Remarks */}
                          <td style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'middle', color: '#000' }}></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="px-6 py-4 border-t border-white/5 flex gap-3 flex-shrink-0">
                <button onClick={() => setDrsModal(false)}
                  className="px-5 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={handleDownloadDRS}
                  className="px-5 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 transition-all flex items-center gap-2">
                  <Download size={14} /> Download PDF
                </button>
                <button onClick={handlePrintDRS}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-red to-red-600 rounded-xl text-xs font-bold text-white shadow-neon-red hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <Printer size={14} /> Print DRS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState<CustomerRecord | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '' })

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditCustomer(null); setForm({ name: '', email: '', phone: '', city: '' }); setShowForm(true) }
  const openEdit = (c: CustomerRecord) => { setEditCustomer(c); setForm({ name: c.name, email: c.email, phone: c.phone, city: c.city }); setShowForm(true) }

  const save = () => {
    if (editCustomer) {
      setCustomers(cs => cs.map(c => c.id === editCustomer.id ? { ...c, ...form } : c))
    } else {
      const newC: CustomerRecord = { id: `C${String(customers.length + 1).padStart(3, '0')}`, ...form, totalShipments: 0, totalSpent: 0, status: 'Active', joinDate: new Date().toISOString().split('T')[0] }
      setCustomers(cs => [...cs, newC])
    }
    setShowForm(false)
  }

  const deleteCustomer = (id: string) => setCustomers(cs => cs.filter(c => c.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Merchant Registries</h1>
          <p className="text-gray-400 text-sm mt-0.5">{customers.length} verified cargo shippers.</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.02] text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-neon-red">
          <Plus size={14} /> Add Shipper
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shippers by name, hub, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/[0.01]">
                <th className="py-3 px-4">Merchant ID</th>
                <th className="py-3 px-4">Merchant Details</th>
                <th className="py-3 px-4">Origin Hub</th>
                <th className="py-3 px-4 text-center">AWB Volume</th>
                <th className="py-3 px-4 text-right">Ledge Spent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-accent-cyan">{c.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-gray-400 mt-0.5">{c.email} · {c.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-semibold">{c.city}</td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">{c.totalShipments} AWB</td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white text-right">{formatCurrency(c.totalSpent)}</td>
                  <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-white transition-all"><Edit size={13} /></button>
                      <button onClick={() => deleteCustomer(c.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-panel p-6 w-full max-w-md border border-white/10 rounded-2xl shadow-glass">
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4">{editCustomer ? 'Edit Shipper Manifest' : 'Register New Shipper'}</h3>
              <div className="space-y-4">
                {[{ label: 'Full Corporate Name', key: 'name', placeholder: 'Rajesh Kumar' }, { label: 'Contact Email', key: 'email', placeholder: 'rajesh@example.com' }, { label: 'Contact Phone', key: 'phone', placeholder: '9876543210' }, { label: 'Registered Hub City', key: 'city', placeholder: 'Mumbai' }].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6 border-t border-white/5 pt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-primary-red to-red-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-neon-red hover:scale-[1.02] transition-all">
                  {editCustomer ? 'Save Specifications' : 'Authorize Shipper'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StickerPage() {
  const [startAwb, setStartAwb] = useState('D1015673004')
  const [count, setCount] = useState(24)
  const [generated, setGenerated] = useState(false)
  const [awbList, setAwbList] = useState<string[]>([])
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'DTDC_Sticker_Sheet',
    pageStyle: `
      @page { size: A4; margin: 8mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  })

  const handleDownloadPDF = async () => {
    if (!printRef.current) return
    const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`DTDC_Stickers_${startAwb}.pdf`)
  }

  const generateStickers = () => {
    const prefix = startAwb.replace(/\d+$/, '')
    const startNum = parseInt(startAwb.replace(/\D/g, ''), 10)
    if (isNaN(startNum)) return
    const list = Array.from({ length: count }, (_, i) => {
      const num = String(startNum + i).padStart(startAwb.replace(/\D/g, '').length, '0')
      return `${prefix}${num}`
    })
    setAwbList(list)
    setGenerated(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">AWB Sticker Sheet Generator</h1>
          <p className="text-gray-400 text-sm mt-0.5">Real scannable barcode stickers — exactly like DTDC sticker PDF.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel p-5 rounded-2xl no-print">
        <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Sticker Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start AWB Number</label>
            <input
              value={startAwb}
              onChange={e => setStartAwb(e.target.value)}
              placeholder="D1015673004"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-red transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Number of Stickers</label>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red transition-all"
            >
              {[12, 24, 48, 72, 100, 150].map(n => <option key={n} value={n}>{n} Stickers</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateStickers}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.02] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-neon-red"
            >
              <Tag size={14} /> Generate Stickers
            </button>
          </div>
        </div>

        {generated && (
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={() => handlePrint()}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-red to-red-600 rounded-xl text-xs font-bold text-white shadow-neon-red hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Printer size={14} /> Print Sticker Sheet
            </button>
          </div>
        )}
      </div>

      {/* Sticker Sheet Preview — exactly like PDF: 3 columns */}
      {generated && (
        <div className="glass-panel p-4 rounded-2xl">
          <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2 mb-4 no-print">
            Preview — {awbList.length} Stickers
          </h2>
          {/* printRef wraps only the white printable area */}
          <div ref={printRef} style={{ background: '#ffffff', padding: '6mm', fontFamily: 'Arial, sans-serif' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4mm',
            }}>
              {awbList.map(awb => (
                <div key={awb} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3mm 2mm 2mm 2mm',
                  background: '#fff',
                  border: '0.5px solid #ccc',
                  pageBreakInside: 'avoid',
                }}>
                  {/* Actual DTDC Logo */}
                  <img
                    src="/dtdc-logo-transparent.png"
                    alt="DTDC"
                    style={{
                      width: '82px',
                      height: '32px',
                      objectFit: 'contain',
                      display: 'block',
                      marginBottom: '2mm',
                    }}
                  />
                  {/* Real Scannable Barcode — same as PDF */}
                  <Barcode
                    value={awb}
                    format="CODE128"
                    width={1.35}
                    height={45}
                    displayValue={true}
                    fontSize={10}
                    fontOptions="bold"
                    margin={0}
                    background="#ffffff"
                    lineColor="#000000"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const reportBookings = [
  { awb: '34567890', date: '2024-01-15', sender: 'Rajesh Kumar', receiver: 'Priya Sharma', route: 'Mumbai → Delhi', status: 'In Transit', amount: 450 },
  { awb: '34567891', date: '2024-01-15', sender: 'Amit Patel', receiver: 'Sunita Verma', route: 'Chennai → Bangalore', status: 'Delivered', amount: 280 },
  { awb: '34567892', date: '2024-01-14', sender: 'Neha Singh', receiver: 'Vikas Gupta', route: 'Kolkata → Hyderabad', status: 'Booked', amount: 620 },
  { awb: '34567893', date: '2024-01-14', sender: 'Ravi Mehta', receiver: 'Anita Joshi', route: 'Pune → Ahmedabad', status: 'Out for Delivery', amount: 350 },
  { awb: '34567894', date: '2024-01-13', sender: 'Kavita Rao', receiver: 'Deepak Nair', route: 'Jaipur → Lucknow', status: 'Failed', amount: 190 },
  { awb: '34567895', date: '2024-01-13', sender: 'Suresh Iyer', receiver: 'Meena Pillai', route: 'Kochi → Trivandrum', status: 'In Transit', amount: 510 },
]

function ReportsPage() {
  const [reportType, setReportType] = useState('Booking Report')
  const [fromDate, setFromDate] = useState('2024-01-01')
  const [toDate, setToDate] = useState('2024-01-31')
  const [branch, setBranch] = useState('All Branches')
  const [generated, setGenerated] = useState(true)

  const reportStatusColors: Record<string, string> = {
    'In Transit': 'bg-blue-950/40 text-blue-400 border border-blue-800/30',
    'Delivered': 'bg-green-950/40 text-green-400 border border-green-800/30',
    'Booked': 'bg-purple-950/40 text-purple-400 border border-purple-800/30',
    'Out for Delivery': 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/30',
    'Failed': 'bg-red-950/40 text-red-400 border border-red-800/30',
    'Returned': 'bg-orange-950/40 text-orange-400 border border-orange-800/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Central Operations Audit</h1>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">Extract system registers and performance reports.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-white/10 text-gray-300 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-1.5">
            <Printer size={12} /> Print PDF
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-primary-red to-red-600 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-neon-red hover:scale-[1.02]">
            <Download size={12} /> Export Ledger
          </button>
        </div>
      </div>

      {/* Modern Filter panel */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
          <Filter size={15} className="text-accent-cyan" />
          <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Report Filter Parameters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all">
              <option>Booking Report</option>
              <option>Delivery Report</option>
              <option>Revenue Report</option>
              <option>Agent Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all">
              <option>All Branches</option>
              <option>Mumbai HQ</option>
              <option>Delhi</option>
              <option>Bangalore</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 border-t border-white/5 pt-4">
          <button onClick={() => setGenerated(true)}
            className="px-5 py-2 bg-gradient-to-r from-primary-red to-red-600 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-neon-red">
            <Search size={12} /> Compile Audit
          </button>
          <button onClick={() => setGenerated(false)}
            className="px-5 py-2 border border-white/10 text-gray-400 rounded-xl text-xs font-bold hover:bg-white/5 transition-all flex items-center gap-1.5">
            <RefreshCw size={12} /> Reset System
          </button>
        </div>
      </div>

      {generated && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'TOTAL manifest', value: '1,842', change: '+12% from last period', positive: true },
              { label: 'DELIVERED awb', value: '1,634', change: '+8% from last period', positive: true },
              { label: 'GROSS LEDGER', value: '₹8,24,500', change: '+18% from last period', positive: true },
              { label: 'PENDING COD', value: '₹1,12,000', change: '-5% from last period', positive: false },
            ].map(s => (
              <div key={s.label} className="glass-panel p-5 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className={cn('text-[10px] font-bold mt-1.5 flex items-center gap-1', s.positive ? 'text-green-400' : 'text-red-400')}>
                  {s.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {s.change}
                </p>
              </div>
            ))}
          </div>

          {/* Audit ledger list */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
              <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest">{reportType} manifests</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-300 hover:bg-white/5 transition-all flex items-center gap-1">
                  <Download size={11} /> CSV
                </button>
                <button className="px-3 py-1.5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-300 hover:bg-white/5 transition-all flex items-center gap-1">
                  <Download size={11} /> Excel
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-4">AWB No.</th>
                    <th className="py-3 px-4">Registry Date</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Receiver</th>
                    <th className="py-3 px-4">Route Hubs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reportBookings.map(b => (
                    <tr key={b.awb} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-accent-cyan tracking-wider">{b.awb}</td>
                      <td className="py-3.5 px-4 text-gray-400 font-semibold">{b.date}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{b.sender}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">{b.receiver}</td>
                      <td className="py-3.5 px-4 text-gray-300 font-semibold">{b.route}</td>
                      <td className="py-3.5 px-4">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', reportStatusColors[b.status] ?? 'bg-gray-800 text-gray-400')}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white text-right">₹{b.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotif: true, smsNotif: false, pushNotif: true,
    autoAssign: true, requireOtp: true, twoFactor: false,
    companyName: 'Desk To Desk Courier & Cargo Ltd.', supportEmail: 'support@desktodesk.com', timezone: 'Asia/Kolkata',
  })

  const toggle = (key: string) => setSettings(s => ({ ...s, [key]: !s[key as keyof typeof s] }))

  const Toggle = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={cn('relative w-10 h-5 rounded-full transition-all border border-white/5', checked ? 'bg-primary-red shadow-neon-red' : 'bg-slate-800')}>
      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">System preferences</h1>
        <p className="text-gray-400 text-sm mt-0.5">Control operational ledgers and admin profiles.</p>
      </div>

      {[
        {
          title: 'Organization registers',
          items: [
            { label: 'Company Identifier', type: 'input', key: 'companyName' },
            { label: 'Central Support Email', type: 'input', key: 'supportEmail' },
            { label: 'Operational Timezone', type: 'select', key: 'timezone', options: ['Asia/Kolkata', 'UTC', 'Asia/Dubai'] },
          ]
        },
        {
          title: 'Notification Routing',
          items: [
            { label: 'Email manifests dispatch', desc: 'Auto-sync AWB manifests with customer emails', type: 'toggle', key: 'emailNotif' },
            { label: 'SMS Tracking API updates', desc: 'Dispatch SMS details for transit shifts', type: 'toggle', key: 'smsNotif' },
            { label: 'Desktop command prompts', desc: 'Display live hub alerts and exceptions', type: 'toggle', key: 'pushNotif' },
          ]
        },
        {
          title: 'System parameters',
          items: [
            { label: 'Auto-Assign Manifest Agents', desc: 'Intelligently allocate driver pipelines on route schedules', type: 'toggle', key: 'autoAssign' },
            { label: 'Enforce OTP Verification', desc: 'Secure booking submissions with 4-digit code authentications', type: 'toggle', key: 'requireOtp' },
            { label: 'Secure Two-Factor authentication', desc: 'Add 2FA checks to admin panel accesses', type: 'toggle', key: 'twoFactor' },
          ]
        },
      ].map(section => (
        <div key={section.title} className="glass-panel p-5 rounded-2xl">
          <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2 mb-4">{section.title}</h2>
          <div className="space-y-4">
            {section.items.map((item: any) => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 last:border-0 pb-4 last:pb-0">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{item.label}</p>
                  {item.desc && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.desc}</p>}
                </div>
                <div className="flex-shrink-0">
                  {item.type === 'toggle' && <Toggle checked={settings[item.key as keyof typeof settings] as boolean} onToggle={() => toggle(item.key)} />}
                  {item.type === 'input' && (
                    <input value={settings[item.key as keyof typeof settings] as string}
                      onChange={e => setSettings(s => ({ ...s, [item.key]: e.target.value }))}
                      className="w-48 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all" />
                  )}
                  {item.type === 'select' && (
                    <select value={settings[item.key as keyof typeof settings] as string}
                      onChange={e => setSettings(s => ({ ...s, [item.key]: e.target.value }))}
                      className="w-48 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all">
                      {item.options.map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <button className="px-5 py-2.5 bg-gradient-to-r from-primary-red to-red-600 hover:scale-[1.02] text-gray-900 dark:text-white rounded-xl text-xs font-bold transition-all shadow-neon-red">
          Save Settings preference
        </button>
      </div>
    </div>
  )
}

const navItems = [
  { id: 'dashboard' as ActivePage, label: 'Control Center', icon: LayoutDashboard },
  { id: 'booking' as ActivePage, label: 'Manifest Parcel', icon: Package },
  { id: 'tracking' as ActivePage, label: 'AWB Tracker', icon: MapPin },
  { id: 'delivery' as ActivePage, label: 'Dispatch Queue', icon: Truck },
  { id: 'customers' as ActivePage, label: 'Shippers List', icon: Users },
  { id: 'sticker' as ActivePage, label: 'Print Labels', icon: Tag },
  { id: 'reports' as ActivePage, label: 'Systems Audit', icon: BarChart3 },
  { id: 'settings' as ActivePage, label: 'Preferences', icon: Settings },
]

export function DtdcErpDashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [dark, setDark] = useState(true)

  // Default theme is dark for premium glass vibe
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [unread, setUnread] = useState(notifications.filter(n => !n.read).length)

  const [userProfile, setUserProfile] = useState({
    name: 'Admin Commander',
    email: 'ops@desktodesk.com',
    phone: '9800000000',
    role: 'Central Administrator',
    city: 'Mumbai HQ',
  })
  const [profileForm, setProfileForm] = useState(userProfile)
  const [profileTab, setProfileTab] = useState<'info' | 'password'>('info')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [helpOpen, setHelpOpen] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [notifList, setNotifList] = useState(notifications)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [dark])

  const navigate = (page: ActivePage) => {
    setActivePage(page)
    setMobileMenuOpen(false)
  }

  const pageComponents: Record<ActivePage, React.ReactNode> = {
    dashboard: <DashboardPage />,
    booking: <BookingPage />,
    tracking: <TrackingPage />,
    delivery: <DeliveryPage />,
    customers: <CustomersPage />,
    sticker: <StickerPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage />,
  }

  const D = dark

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: D ? '#080b11' : '#f8fafc' }}>
      
      {/* Dynamic Animated background glows */}
      {D && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] rounded-full bg-primary-red/10 blur-[130px] animate-blob" />
          <div className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[55%] rounded-full bg-accent-cyan/10 blur-[130px] animate-blob-reverse" />
          <div className="absolute top-[35%] right-[20%] w-[38%] h-[38%] rounded-full bg-primary-red/5 blur-[110px] animate-blob" />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:flex flex-col border-r transition-all duration-300 flex-shrink-0 z-20 relative glass-panel',
        D ? 'border-white/5' : 'bg-white border-slate-200/60',
        sidebarCollapsed ? 'w-16' : 'w-60')}>
        <div className={cn('flex items-center justify-between p-4 border-b h-16', D ? 'border-white/5' : 'border-slate-200/60')}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary-red rounded-lg flex-shrink-0 flex items-center justify-center text-gray-900 dark:text-white font-black text-xs shadow-neon-red">D</div>
              <span className={cn('font-black text-sm tracking-widest text-gray-900 dark:text-white')}>DESK TO DESK ERP</span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(c => !c)} className={cn('p-1.5 rounded-lg transition-colors ml-auto hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:text-white')}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activePage === item.id
            return (
              <button key={item.id} onClick={() => navigate(item.id)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all',
                  isActive
                    ? D ? 'bg-gradient-to-r from-primary-red/15 to-transparent text-primary-red border-l-2 border-primary-red shadow-[inset_4px_0_12px_rgba(255,59,48,0.08)]' : 'bg-red-50 text-primary-red border-l-2 border-primary-red'
                    : D ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'text-gray-500 hover:bg-slate-100 hover:text-slate-900',
                  sidebarCollapsed && 'justify-center')}>
                <item.icon size={16} className="flex-shrink-0" />
                {!sidebarCollapsed && item.label}
              </button>
            )
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className={cn('p-4 border-t', D ? 'border-white/5' : 'border-slate-200/60')}>
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-accent-cyan')}>
                <User size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{userProfile.name}</p>
                <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-60 z-50 lg:hidden flex flex-col glass-panel border-r border-white/5">
              <div className="flex items-center justify-between p-4 border-b border-white/5 h-16">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary-red rounded-lg flex items-center justify-center text-gray-900 dark:text-white font-black text-xs shadow-neon-red">D</div>
                  <span className="font-black text-sm tracking-widest text-gray-900 dark:text-white">DESK TO DESK ERP</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {navItems.map(item => {
                  const isActive = activePage === item.id
                  return (
                    <button key={item.id} onClick={() => navigate(item.id)}
                      className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all',
                        isActive ? 'bg-primary-red/10 border-l-2 border-primary-red text-primary-red' : 'text-gray-400 hover:bg-white/5 hover:text-gray-900 dark:text-white')}>
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Core View Area */}
      <div className="flex-1 flex flex-col overflow-hidden z-10 relative">
        {/* Header */}
        <header className={cn('h-16 border-b flex items-center px-4 gap-3 flex-shrink-0 glass-panel relative z-40', D ? 'border-white/5' : 'bg-white border-slate-200/60')}>
          <button onClick={() => setMobileMenuOpen(true)} className={cn('lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400')}>
            <Menu size={20} />
          </button>
          
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Query shipments, manifests, shippers..."
                className={cn('w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-red transition-all border',
                  D ? 'bg-slate-950/40 border-white/5 text-gray-900 dark:text-white placeholder-gray-500' : 'bg-slate-100 border-slate-200 text-slate-900')} />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Theme switcher */}
            <button onClick={() => setDark(d => !d)}
              className={cn('p-2 rounded-xl transition-all border border-white/5 hover:scale-105', D ? 'bg-white/5 text-accent-cyan' : 'bg-slate-100 text-yellow-500')}
              title={D ? 'Activate Light Mode' : 'Activate Dark Mode'}>
              {D ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Notification alert bells */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(n => !n); setProfileOpen(false) }}
                className={cn('p-2 rounded-xl transition-all border border-white/5 text-gray-400 hover:text-gray-900 dark:text-white hover:bg-white/5 relative')}>
                <Bell size={16} />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-red rounded-full pulsing-dot text-primary-red" />}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-xl z-50 border border-white/10 glass-panel dropdown-panel overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <p className="font-bold text-xs uppercase tracking-widest text-gray-900 dark:text-white">System notifications</p>
                      <button onClick={() => { setNotifList(nl => nl.map(n => ({ ...n, read: true }))); setUnread(0) }}
                        className="text-[10px] text-accent-cyan hover:underline font-bold uppercase tracking-wider">Flush Alerts</button>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                      {notifList.map(n => (
                        <div key={n.id} onClick={() => { setNotifList(nl => nl.map(x => x.id === n.id ? { ...x, read: true } : x)); setUnread(u => Math.max(0, u - (n.read ? 0 : 1))) }}
                          className={cn('p-4 flex gap-3 cursor-pointer transition-colors hover:bg-white/[0.02]',
                            !n.read && 'bg-accent-cyan/5')}>
                          <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', n.read ? 'bg-gray-600' : 'bg-accent-cyan pulsing-dot text-accent-cyan')} />
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{n.text}</p>
                            <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => { setProfileOpen(p => !p); setNotifOpen(false) }}
                className="flex items-center gap-2 p-1 rounded-xl transition-all border border-white/5 hover:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan">
                  <User size={15} />
                </div>
                <ChevronDown size={12} className="text-gray-400 hidden sm:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-xl z-50 overflow-hidden border border-white/10 glass-panel dropdown-panel">
                    <div className="p-3 border-b border-white/5 bg-white/[0.01]">
                      <p className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">{userProfile.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{userProfile.email}</p>
                    </div>
                    <button onClick={() => { setProfileOpen(false); setProfileEditOpen(true); setProfileForm(userProfile); setProfileTab('info'); setPasswordError(''); setPasswordSuccess(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <User size={13} className="text-gray-400" /> Edit Profile
                    </button>
                    <button onClick={() => { setProfileOpen(false); setHelpOpen(true) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <HelpCircle size={13} className="text-gray-400" /> Help Desk
                    </button>
                    <button onClick={() => { setProfileOpen(false); setLogoutConfirm(true) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-red hover:bg-red-500/10 transition-colors">
                      <LogOut size={13} className="text-primary-red" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {pageComponents[activePage]}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden flex border-t border-white/5 flex-shrink-0 z-20 relative glass-panel">
          {navItems.slice(0, 5).map(item => {
            const isActive = activePage === item.id
            return (
              <button key={item.id} onClick={() => navigate(item.id)}
                className={cn('flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors',
                  isActive ? 'text-primary-red' : 'text-gray-400 hover:text-gray-900 dark:text-white')}>
                <item.icon size={18} />
              </button>
            )
          })}
        </nav>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {profileEditOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="glass-panel w-full max-w-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Account Specifications</h3>
                <button onClick={() => setProfileEditOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-accent-cyan select-none shadow-neon-cyan">
                  {profileForm.name.trim()[0]?.toUpperCase() ?? 'A'}
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Central Operations Profile</p>
              </div>

              <div className="flex gap-1.5 px-6 pb-2 pt-4">
                {(['info', 'password'] as const).map(tab => (
                  <button key={tab} onClick={() => { setProfileTab(tab); setPasswordError(''); setPasswordSuccess(false) }}
                    className={cn('flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                      profileTab === tab ? 'bg-primary-red text-gray-900 dark:text-white shadow-neon-red' : 'text-gray-400 hover:bg-white/5 hover:text-gray-900 dark:text-white')}>
                    {tab === 'info' ? 'Parameters' : 'Ledger Key'}
                  </button>
                ))}
              </div>

              <div className="px-6 pb-6 pt-3 space-y-3">
                {profileTab === 'info' ? (
                  <>
                    {[
                      { label: 'Full Corporate Name', key: 'name', placeholder: 'Your name', icon: User },
                      { label: 'Email Registry', key: 'email', placeholder: 'you@example.com', icon: Mail },
                      { label: 'Contact Phone', key: 'phone', placeholder: '9800000000', icon: Phone },
                      { label: 'System Designation', key: 'role', placeholder: 'Administrator', icon: Layers },
                      { label: 'Operational Hub', key: 'city', placeholder: 'Mumbai HQ', icon: MapPinIcon },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.label}</label>
                        <div className="relative">
                          <f.icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            value={profileForm[f.key as keyof typeof profileForm]}
                            onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3 pt-3 border-t border-white/5">
                      <button onClick={() => setProfileEditOpen(false)}
                        className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 transition-all">
                        Cancel
                      </button>
                      <button onClick={() => { setUserProfile(profileForm); setProfileEditOpen(false) }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-primary-red to-red-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-neon-red hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5">
                        <Check size={14} /> Commit Changes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { label: 'Current Credentials', key: 'current' },
                      { label: 'New Credentials', key: 'next' },
                      { label: 'Confirm New Credentials', key: 'confirm' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{f.label}</label>
                        <input
                          type="password"
                          value={passwords[f.key as keyof typeof passwords]}
                          onChange={e => { setPasswords(p => ({ ...p, [f.key]: e.target.value })); setPasswordError(''); setPasswordSuccess(false) }}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent transition-all" />
                      </div>
                    ))}
                    {passwordError && (
                      <p className="text-[10px] text-red-400 font-bold flex items-center gap-1"><AlertCircle size={12} /> {passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <p className="text-[10px] text-green-400 font-bold flex items-center gap-1"><CheckCircle size={12} /> Password updated successfully!</p>
                    )}
                    <div className="flex gap-3 pt-3 border-t border-white/5">
                      <button onClick={() => setProfileEditOpen(false)}
                        className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 transition-all">
                        Cancel
                      </button>
                      <button onClick={() => {
                        if (!passwords.current) { setPasswordError('Enter your current credentials.'); return }
                        if (passwords.next.length < 6) { setPasswordError('Ledger key must be at least 6 char.'); return }
                        if (passwords.next !== passwords.confirm) { setPasswordError('Keys do not match.'); return }
                        setPasswordSuccess(true)
                        setPasswords({ current: '', next: '', confirm: '' })
                      }} className="flex-1 py-2.5 bg-gradient-to-r from-primary-red to-red-600 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-neon-red hover:scale-[1.02] transition-all">
                        Update Key
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="glass-panel w-full max-w-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-accent-cyan" />
                  <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Operational Helpdesk</h3>
                </div>
                <button onClick={() => setHelpOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { icon: Phone, label: 'Central Helpline', value: '1800-123-4567', sub: 'Hub Support hours: 24/7' },
                  { icon: Mail, label: 'Email Systems Support', value: 'systems@desktodesk.com', sub: 'Response inside 1 hr' },
                  { icon: MapPinIcon, label: 'Headquarters Depot', value: 'Desk To Desk Executive Plaza, Bangalore', sub: 'India Ops' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-accent-cyan">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider leading-none mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                      <p className="text-[10px] text-gray-500 font-semibold">{item.sub}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-500 text-center pt-1 font-semibold">Desk To Desk Operational Command Center v2.4 (Internal)</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="glass-panel w-full max-w-sm border border-white/10 rounded-2xl shadow-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-primary-red">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">System Sign-out?</h3>
              <p className="text-xs text-gray-400 font-medium mb-6">You will lock your current operational ledger manifest.</p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutConfirm(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={() => { setLogoutConfirm(false); alert('System session terminated successfully.') }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-red to-red-600 text-gray-900 dark:text-white rounded-xl text-xs font-bold shadow-neon-red hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
