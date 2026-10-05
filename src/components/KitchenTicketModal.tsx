import React from 'react';
import { X, Printer, ChefHat, Calendar, Clock, MapPin, CheckSquare } from 'lucide-react';
import { Order } from '../types.ts';

interface KitchenTicketModalProps {
  order: Order;
  onClose: () => void;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({
  order,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-base">Baker Kitchen Production Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div id="printable-kitchen-ticket" className="p-6 font-mono text-xs text-stone-800 space-y-4">
          <div className="text-center pb-4 border-b-2 border-dashed border-stone-300">
            <h2 className="font-serif font-bold text-xl text-stone-900">🍰 Sweet Home Bakery</h2>
            <p className="text-[11px] text-stone-500">Order Dispatch Slip • Kitchen Copy</p>
            <div className="mt-2 inline-block px-3 py-1 bg-stone-100 rounded-lg text-sm font-bold text-stone-900">
              ORDER #{order.id}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-stone-600">
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Date</span>
              <span className="font-bold text-stone-900">{order.deliveryDate}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Slot</span>
              <span className="font-bold text-stone-900">{order.deliverySlot || 'Standard'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Customer</span>
              <span className="font-bold text-stone-900">{order.customerName}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Contact</span>
              <span className="font-bold text-stone-900">{order.contactNumber}</span>
            </div>
          </div>

          {/* Item details */}
          <div className="py-3 border-y-2 border-dashed border-stone-300">
            <div className="flex justify-between font-bold text-stone-900 text-sm mb-1">
              <span>{order.quantity}x {order.product}</span>
              <span>₹{order.total}</span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                {order.isEggless ? '100% EGGLESS' : 'REGULAR RECIPE'}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                STATUS: {order.status}
              </span>
            </div>
          </div>

          {/* Customization Callout */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="block text-[10px] font-bold text-amber-800 uppercase mb-1">
              🎂 Cake Message / Instructions:
            </span>
            <p className="font-sans font-medium text-stone-900 leading-snug">
              {order.customization || 'No special instruction'}
            </p>
          </div>

          {/* Delivery destination */}
          <div>
            <span className="block text-[10px] font-bold text-stone-400 uppercase">Delivery Address:</span>
            <p className="font-sans text-stone-800 text-xs mt-0.5">{order.deliveryAddress}</p>
          </div>

          {/* Chef Checklist */}
          <div className="pt-2 border-t border-stone-200">
            <span className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Quality & Packing Checklist:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded text-amber-800" />
                <span>Base Baked & Cooled</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded text-amber-800" />
                <span>Frosting Inspected</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded text-amber-800" />
                <span>Candles & Knife Boxed</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="rounded text-amber-800" />
                <span>Chilled Bag Sealed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">Ready for oven rack attachment</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
