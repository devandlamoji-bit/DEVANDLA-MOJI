import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Flame,
  PackageCheck,
  Truck,
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  Phone,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';
import { STATUS_CONFIG } from '../data/products.ts';

interface OrderTrackingViewProps {
  orders: Order[];
  initialOrderId?: number;
  onRefresh: () => void;
}

const STEPS: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
  {
    status: 'CONFIRMED',
    label: 'Order Confirmed',
    icon: CheckCircle2,
    desc: 'Baker acknowledged recipe & set up schedule',
  },
  {
    status: 'BAKING',
    label: 'Baking & Decorating',
    icon: Flame,
    desc: 'Whisking, oven baking & hand-piping frosting',
  },
  {
    status: 'READY',
    label: 'Ready for Dispatch',
    icon: PackageCheck,
    desc: 'Boxed in artisan packaging with candles & knife',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    icon: Truck,
    desc: 'Courier vehicle en route to delivery address',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    icon: Sparkles,
    desc: 'Delivered fresh at your doorstep!',
  },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  initialOrderId,
  onRefresh,
}) => {
  const [searchInput, setSearchInput] = useState<string>(
    initialOrderId ? initialOrderId.toString() : ''
  );
  const [searchedId, setSearchedId] = useState<string>(
    initialOrderId ? initialOrderId.toString() : orders[0]?.id?.toString() || ''
  );

  const matchedOrder = orders.find(
    (o) =>
      o.id.toString() === searchedId.trim().replace('#', '') ||
      o.contactNumber.replace(/\D/g, '').includes(searchedId.replace(/\D/g, ''))
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedId(searchInput);
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 0;
      case 'BAKING':
        return 1;
      case 'READY':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = matchedOrder ? getStepIndex(matchedOrder.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Truck className="w-3.5 h-3.5 text-amber-700" />
          Real-Time Oven & Delivery Tracker
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          Track Your Sweet Delivery
        </h2>
        <p className="text-sm text-stone-600">
          Enter your Order ID (e.g. 1001) or registered phone number to follow your cake&apos;s journey from oven to doorstep.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex gap-2 max-w-lg mx-auto bg-white p-2 rounded-2xl border-2 border-stone-200 focus-within:border-amber-600 shadow-sm transition-all">
          <div className="flex-1 flex items-center pl-3">
            <Search className="w-5 h-5 text-stone-400 mr-2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Order # (e.g. 1001) or phone number"
              className="w-full text-sm text-stone-900 bg-transparent border-0 focus:ring-0 placeholder:text-stone-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            Track Order
          </button>
        </div>

        {/* Quick Recent order suggestions */}
        {orders.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-stone-500">
            <span>Recent orders:</span>
            {orders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchInput(o.id.toString());
                  setSearchedId(o.id.toString());
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                  matchedOrder?.id === o.id
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                #{o.id} ({o.product})
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Tracking Result */}
      {matchedOrder ? (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg overflow-hidden animate-in fade-in duration-300">
          {/* Card Top */}
          <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-stone-950 font-mono font-bold text-xs">
                  ORDER #{matchedOrder.id}
                </span>
                <span className="text-xs text-amber-200/80">
                  {matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold">
                {matchedOrder.quantity}x {matchedOrder.product}
              </h3>
              <p className="text-xs text-amber-100/90 mt-1">
                Ordered by {matchedOrder.customerName} • {matchedOrder.contactNumber}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-bold text-amber-200/80 block">Order Total</span>
              <span className="font-serif text-3xl font-bold text-amber-300">
                ₹{matchedOrder.total}
              </span>
              <span className="text-[11px] text-amber-200/70 block mt-0.5">
                {matchedOrder.isEggless ? '100% Eggless' : 'Regular'}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-6 sm:p-8 border-b border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
              Kitchen & Delivery Milestones
            </h4>

            <div className="relative">
              {/* Stepper Line Background */}
              <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-stone-100 -z-0">
                <div
                  className="h-full bg-amber-600 transition-all duration-500"
                  style={{
                    width: `${(Math.max(0, currentStepIdx) / (STEPS.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>

              {/* Steps List */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.status}
                      className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 rounded-xl"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-amber-600 text-white ring-4 ring-amber-500/20 shadow-md scale-110'
                            : isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>

                      <div>
                        <span
                          className={`text-xs font-bold block ${
                            isCurrent
                              ? 'text-amber-800 font-extrabold'
                              : isCompleted
                              ? 'text-stone-900'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <p className="text-[11px] text-stone-500 leading-tight hidden sm:block mt-1">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Status Callout */}
          <div className="p-6 sm:p-8 bg-amber-50/40 border-b border-stone-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-800 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Current Status
                </span>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  {STATUS_CONFIG[matchedOrder.status]?.label || matchedOrder.status}
                </h4>
                <p className="text-sm text-stone-600 mt-1">
                  {STATUS_CONFIG[matchedOrder.status]?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery & Customization Info */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
              <span className="text-stone-400 font-bold uppercase tracking-wider block">
                Delivery Schedule & Location
              </span>
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{matchedOrder.deliveryDate} ({matchedOrder.deliverySlot || 'Standard'})</span>
              </div>
              <div className="flex items-start gap-2 text-stone-700">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{matchedOrder.deliveryAddress}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
              <span className="text-stone-400 font-bold uppercase tracking-wider block">
                Custom Message on Cake
              </span>
              <p className="text-stone-800 italic font-serif text-sm leading-relaxed">
                &ldquo;{matchedOrder.customization || 'No message or custom instructions requested'}&rdquo;
              </p>
              <div className="pt-2 flex items-center gap-2 text-stone-500">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Need modifications? Contact Baker at +91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center shadow-xs">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
            Order #{searchInput || '...'} not found
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-4">
            We couldn&apos;t find an active order matching this ID or phone number. Check your confirmation receipt or try selecting from the recent orders above.
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
          >
            Refresh System Database
          </button>
        </div>
      )}
    </div>
  );
};
