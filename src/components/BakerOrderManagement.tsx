import React, { useState } from 'react';
import {
  ChefHat,
  RotateCw,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  Flame,
  PackageCheck,
  Truck,
  Sparkles,
  Printer,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Receipt,
  XCircle,
  Trash2,
} from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';
import { STATUS_CONFIG } from '../data/products.ts';
import { KitchenTicketModal } from './KitchenTicketModal.tsx';

interface BakerOrderManagementProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  onDeleteOrder: (id: number) => Promise<void>;
  onAddSampleOrder: () => void;
  onResetSamples: () => void;
}

export const BakerOrderManagement: React.FC<BakerOrderManagementProps> = ({
  orders,
  loading,
  onRefresh,
  onUpdateStatus,
  onDeleteOrder,
  onAddSampleOrder,
  onResetSamples,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Status buttons specified by user: CONFIRMED, BAKING, READY, OUT_FOR_DELIVERY, DELIVERED
  const statusOptions: { key: OrderStatus; label: string; icon: any }[] = [
    { key: 'CONFIRMED', label: 'Confirm', icon: CheckCircle2 },
    { key: 'BAKING', label: 'Baking', icon: Flame },
    { key: 'READY', label: 'Ready', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Sparkles },
  ];

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatusFilter === 'ALL' || order.status === selectedStatusFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toString().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.contactNumber.toLowerCase().includes(q) ||
      order.product.toLowerCase().includes(q) ||
      order.customization.toLowerCase().includes(q) ||
      order.deliveryAddress.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeBaking = orders.filter((o) => o.status === 'BAKING').length;
  const readyForPickup = orders.filter((o) => o.status === 'READY').length;
  const outForDelivery = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;

  const handleStatusClick = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shadow-md">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  👩‍🍳 Baker Order Management
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Kitchen Portal
                </span>
              </div>
              <p className="text-stone-500 text-sm">
                Real-time queue monitoring, status updates, and baker dispatch
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 font-semibold text-xs sm:text-sm text-stone-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-700' : ''}`} />
              <span>Refresh Orders</span>
            </button>

            <button
              onClick={onAddSampleOrder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Quick Test Order</span>
            </button>

            <button
              onClick={onResetSamples}
              title="Reset default sample orders"
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
              <span>Total Orders</span>
              <Receipt className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {orders.length}
            </div>
            <span className="text-[11px] text-stone-500">Live in system</span>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
              <span>In Oven / Baking</span>
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-orange-950">
              {activeBaking}
            </div>
            <span className="text-[11px] text-orange-700">Currently in preparation</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/60">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-purple-800 mb-1">
              <span>Ready & Transit</span>
              <PackageCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-purple-950">
              {readyForPickup + outForDelivery}
            </div>
            <span className="text-[11px] text-purple-700">{readyForPickup} ready, {outForDelivery} out</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <span>Total Revenue</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-700">Gross order value</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', 'CONFIRMED', 'BAKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => {
            const count =
              st === 'ALL'
                ? orders.length
                : orders.filter((o) => o.status === st).length;
            const isSelected = selectedStatusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
                }`}
              >
                <span>{st === 'ALL' ? 'All Orders' : STATUS_CONFIG[st]?.label || st}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-amber-900/60 text-amber-100' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order #, Name, Cake..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Orders List Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 font-serif text-3xl">
            🧁
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">No orders available.</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
            {searchQuery || selectedStatusFilter !== 'ALL'
              ? 'No orders matched your current filters. Try resetting the filter.'
              : 'There are currently no active orders in the queue. You can place a new order or add a sample order.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Reset Filters
            </button>
            <button
              onClick={onAddSampleOrder}
              className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
            >
              Add Sample Order
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => {
            const statusMeta = STATUS_CONFIG[order.status] || {
              label: order.status,
              color: 'text-stone-700',
              bg: 'bg-stone-100',
              border: 'border-stone-300',
            };

            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Top Ribbon */}
                <div className="p-5 sm:px-6 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-xl bg-stone-900 text-white font-mono font-bold text-sm tracking-wide shadow-xs">
                      #{order.id}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                        Order #{order.id}
                      </h3>
                      <span className="text-xs text-stone-500">
                        Placed on {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      {order.status}
                    </span>

                    {/* Print ticket */}
                    <button
                      onClick={() => setTicketOrder(order)}
                      title="Print Baker Slip"
                      className="p-2 rounded-xl border border-stone-200 hover:bg-white text-stone-600 hover:text-amber-800 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Delete order */}
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      title="Delete Order"
                      className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Customer & Product info */}
                  <div className="md:col-span-4 space-y-3 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0 md:pr-4">
                    <div>
                      <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                        Customer
                      </span>
                      <p className="font-bold text-stone-900 text-base">{order.customerName}</p>
                      <a
                        href={`tel:${order.contactNumber}`}
                        className="text-xs text-amber-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        {order.contactNumber}
                      </a>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                        Product & Quantity
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-stone-900 text-lg">
                          {order.product}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                          Qty: {order.quantity}
                        </span>
                      </div>
                      {order.isEggless && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Eggless
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                        Order Total
                      </span>
                      <span className="font-serif text-2xl font-bold text-amber-900">
                        ₹{order.total}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Customization & Delivery info */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Kitchen Customization Note */}
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Customization / Kitchen Instructions</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic text-stone-800">
                          &ldquo;{order.customization || 'No special customization requested'}&rdquo;
                        </p>
                      </div>

                      {/* Delivery Date & Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-stone-400 font-bold block mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-500" />
                            Delivery Schedule
                          </span>
                          <span className="font-bold text-stone-900 text-sm block">{order.deliveryDate}</span>
                          <span className="text-stone-500 text-[11px]">{order.deliverySlot || 'Standard Delivery'}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                          <span className="text-stone-400 font-bold block mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-500" />
                            Delivery Address
                          </span>
                          <span className="text-stone-800 font-medium line-clamp-2 leading-tight">
                            {order.deliveryAddress}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Action Buttons - Exactly the 5 requested in user's prompt */}
                    <div className="pt-3 border-t border-stone-100">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400 block mb-2">
                        Update Status Pipeline:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {statusOptions.map((opt) => {
                          const isActive = order.status === opt.key;
                          const Icon = opt.icon;

                          return (
                            <button
                              key={opt.key}
                              disabled={isUpdating}
                              onClick={() => handleStatusClick(order.id, opt.key)}
                              className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-800 text-white shadow-md ring-2 ring-amber-700/20'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                              } disabled:opacity-50`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Kitchen Slip Modal */}
      {ticketOrder && (
        <KitchenTicketModal
          order={ticketOrder}
          onClose={() => setTicketOrder(null)}
        />
      )}
    </div>
  );
};
