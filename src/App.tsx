/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { CustomerOrderView } from './components/CustomerOrderView.tsx';
import { BakerOrderManagement } from './components/BakerOrderManagement.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import {
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
  createOrder,
  resetOrders,
} from './api.ts';
import { Order } from './types.ts';
import { Heart, Sparkles, Phone, MapPin, Clock } from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTab, setCurrentTab] = useState<'order' | 'baker' | 'track'>('order');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [trackingTargetId, setTrackingTargetId] = useState<number | undefined>(undefined);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle status update (matches PUT /api/orders/:id/status?status=...)
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateOrderStatus(id, status);
      // Immediately reflect in local state
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o))
      );
    } catch (err: any) {
      console.error('Status update failed:', err);
      setError(err.message || 'Status update failed');
      // Refresh to ensure sync
      loadOrders();
    }
  };

  // Handle deleting an order
  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      console.error('Failed to delete order:', err);
    }
  };

  // When a new customer order is placed
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
  };

  // Navigate to track order
  const handleTrackOrder = (orderId: number) => {
    setTrackingTargetId(orderId);
    setCurrentTab('track');
  };

  // Quick sample test order for baker testing
  const handleAddSampleOrder = async () => {
    const sampleCakes = [
      { product: 'Chocolate Cake', total: 950, isEggless: true, cust: 'Double chocolate curls, write "Happy 30th Dev!"' },
      { product: 'Red Velvet Cake', total: 890, isEggless: false, cust: 'Cream cheese rosettes with edible gold dust' },
      { product: 'Birthday Cake', total: 850, isEggless: true, cust: 'Pastel rainbow sprinkles, rainbow topper' },
      { product: 'Cupcake', total: 480, isEggless: true, cust: 'Box of 4 assorted berries and salted caramel' },
    ];
    const pick = sampleCakes[Math.floor(Math.random() * sampleCakes.length)];
    const sampleNames = ['Rohan Kapoor', 'Meera Singhania', 'Aditya Roy', 'Sneha Kulkarni'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];

    const created = await createOrder({
      customerName: randomName,
      contactNumber: '+91 9' + Math.floor(100000000 + Math.random() * 900000000),
      product: pick.product,
      quantity: 1,
      customization: pick.cust,
      deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      deliveryAddress: 'Flat 102, Magnolia Residency, Indiranagar, Bengaluru',
      total: pick.total,
      isEggless: pick.isEggless,
      deliverySlot: '01:00 PM - 04:00 PM',
    });

    setOrders((prev) => [created, ...prev]);
  };

  // Reset demo orders
  const handleResetSamples = async () => {
    setLoading(true);
    try {
      const reset = await resetOrders();
      setOrders(reset);
    } finally {
      setLoading(false);
    }
  };

  // Active orders in kitchen (confirmed or baking or ready)
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'BAKING' || o.status === 'READY'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-stone-800">
      {/* Top Navbar */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'baker') {
            loadOrders();
          }
        }}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'order' && (
          <CustomerOrderView
            onOrderCreated={handleOrderCreated}
            onTrackOrder={handleTrackOrder}
            onGoToBaker={() => {
              setCurrentTab('baker');
              loadOrders();
            }}
          />
        )}

        {currentTab === 'baker' && (
          <BakerOrderManagement
            orders={orders}
            loading={loading}
            onRefresh={loadOrders}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleDeleteOrder}
            onAddSampleOrder={handleAddSampleOrder}
            onResetSamples={handleResetSamples}
          />
        )}

        {currentTab === 'track' && (
          <OrderTrackingView
            orders={orders}
            initialOrderId={trackingTargetId}
            onRefresh={loadOrders}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
            {/* Bakery Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍰</span>
                <span className="font-serif text-lg font-bold text-white tracking-wide">
                  Sweet Home Bakery
                </span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                Handcrafted artisan cakes, cupcakes, and cookies made fresh to order. Wholesome ingredients, zero chemical stabilizers, and 100% vegetarian options.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-bold text-stone-200 text-xs uppercase tracking-wider mb-3">
                Navigation
              </h5>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentTab('order')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Place Custom Cake Order
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('baker')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Baker Kitchen Management ({activeOrdersCount} in progress)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('track')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Real-time Order Tracker
                  </button>
                </li>
              </ul>
            </div>

            {/* Timings */}
            <div>
              <h5 className="font-bold text-stone-200 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Bakery Hours
              </h5>
              <p className="text-stone-400 leading-relaxed">
                Monday &ndash; Sunday<br />
                8:00 AM &ndash; 10:00 PM IST<br />
                <span className="text-amber-300 font-semibold mt-1 block">
                  Same-day slots available before 4:00 PM
                </span>
              </p>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-bold text-stone-200 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Kitchen & Dispatch
              </h5>
              <p className="text-stone-400 leading-relaxed mb-2">
                Sweet Home Bakery Workshop<br />
                12th Main, 4th Cross, Indiranagar<br />
                Bengaluru, Karnataka 560038
              </p>
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <span>Direct Kitchen: +91 98765 43210</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <p>© {new Date().getFullYear()} Sweet Home Bakery. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Freshly baked with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for celebrations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
