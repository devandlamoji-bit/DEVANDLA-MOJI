import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Phone,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  ArrowRight,
  Flame,
  Gift,
  Copy,
  Check,
} from 'lucide-react';
import { BAKERY_PRODUCTS, DELIVERY_TIME_SLOTS } from '../data/products.ts';
import { Order, OrderFormState } from '../types.ts';

interface CustomerOrderViewProps {
  onOrderCreated: (newOrder: Order) => void;
  onTrackOrder: (orderId: number) => void;
  onGoToBaker: () => void;
}

const CUSTOMIZATION_SUGGESTIONS = [
  'Write "Happy Birthday Aisha!" in gold script 🎂',
  'Dark chocolate ganache, eggless, less sweet 🍫',
  'Decorate with pink buttercream rosettes & pearls 🌸',
  'Please include 6 celebration candles & knife 🕯️',
  'Gluten-friendly preparation if possible 🌾',
];

export const CustomerOrderView: React.FC<CustomerOrderViewProps> = ({
  onOrderCreated,
  onTrackOrder,
  onGoToBaker,
}) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState<OrderFormState>({
    customerName: '',
    contactNumber: '',
    product: 'Birthday Cake',
    quantity: 1,
    customization: '',
    deliveryDate: tomorrow,
    deliveryAddress: '',
    isEggless: true,
    deliverySlot: DELIVERY_TIME_SLOTS[0],
  });

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Selected product details
  const selectedProduct =
    BAKERY_PRODUCTS.find((p) => p.name === form.product) || BAKERY_PRODUCTS[0];

  const basePrice = selectedProduct.price;
  const egglessPrice = form.isEggless ? 50 * form.quantity : 0;
  const deliveryFee = 0; // Free local bakery delivery
  const estimatedTotal = basePrice * form.quantity + egglessPrice + deliveryFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProductSelect = (productName: string) => {
    setForm((prev) => ({ ...prev, product: productName }));
  };

  const handleQuantityAdjust = (delta: number) => {
    setForm((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  const applyCustomizationPreset = (text: string) => {
    setForm((prev) => ({
      ...prev,
      customization: prev.customization
        ? `${prev.customization}, ${text}`
        : text,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setConfirmedOrder(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: form.customerName,
          contactNumber: form.contactNumber,
          product: form.product,
          quantity: Number(form.quantity),
          customization: form.customization,
          deliveryDate: form.deliveryDate,
          deliveryAddress: form.deliveryAddress,
          isEggless: form.isEggless,
          deliverySlot: form.deliverySlot,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order: Order = await response.json();
      setConfirmedOrder(order);
      onOrderCreated(order);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
        });
      } catch {
        // Safe if confetti fails
      }

      // Reset form
      setForm({
        customerName: '',
        contactNumber: '',
        product: 'Birthday Cake',
        quantity: 1,
        customization: '',
        deliveryDate: tomorrow,
        deliveryAddress: '',
        isEggless: true,
        deliverySlot: DELIVERY_TIME_SLOTS[0],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = (id: number) => {
    navigator.clipboard?.writeText(id.toString());
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-rose-950 text-white p-6 sm:p-10 mb-10 shadow-xl shadow-amber-950/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Baked Fresh to Order • Zero Artificial Preservatives
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Handcrafted Treats For Your Special Celebrations
          </h2>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Choose from our artisanal cakes, customize flavors and personal messages, and watch our baker prepare your delight in real time.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-amber-200">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Kitchen Accepting Fresh Orders
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <span>🥚 Eggless / Vegan options available</span>
            </div>
          </div>
        </div>

        {/* Decorative backdrop illustration elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden md:flex items-center justify-center font-serif text-9xl">
          🎂
        </div>
      </div>

      {/* Confirmation Card if newly created */}
      {confirmedOrder && (
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 shadow-lg text-emerald-950 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">Order Confirmed!</span>
                <h3 className="font-serif text-2xl font-bold text-emerald-950">
                  Order #{confirmedOrder.id} confirmed! Total: ₹{confirmedOrder.total}
                </h3>
                <p className="text-sm text-emerald-800">
                  Thank you, <strong className="font-semibold">{confirmedOrder.customerName}</strong>! Our kitchen has received your order and started preparing the ingredients.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={() => copyOrderId(confirmedOrder.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedId ? 'Copied #' : 'Copy Order #'}
              </button>

              <button
                onClick={() => onTrackOrder(confirmedOrder.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-colors"
              >
                <span>Track Live Progress</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-emerald-700/80 block">Product</span>
              <span className="font-bold text-emerald-950 text-sm">{confirmedOrder.quantity}x {confirmedOrder.product}</span>
            </div>
            <div>
              <span className="text-emerald-700/80 block">Delivery Date</span>
              <span className="font-bold text-emerald-950 text-sm">{confirmedOrder.deliveryDate}</span>
            </div>
            <div>
              <span className="text-emerald-700/80 block">Delivery Address</span>
              <span className="font-bold text-emerald-950 text-sm line-clamp-1">{confirmedOrder.deliveryAddress}</span>
            </div>
            <div>
              <span className="text-emerald-700/80 block">Kitchen Status</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-blue-800 bg-blue-100 text-xs">
                {confirmedOrder.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Order Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Menu Selector & Order Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Select Bakery Product */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-700">Step 1</span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Choose Your Favorite Bake</h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">Click to select item</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BAKERY_PRODUCTS.map((prod) => {
                const isSelected = form.product === prod.name;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleProductSelect(prod.name)}
                    className={`group cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 relative flex flex-col ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/40 ring-4 ring-amber-500/10 shadow-md'
                        : 'border-stone-200 hover:border-amber-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    {/* Badge */}
                    {prod.badge && (
                      <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[11px] font-bold rounded-md bg-stone-950/80 text-white backdrop-blur-xs">
                        {prod.badge}
                      </span>
                    )}

                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="h-36 w-full overflow-hidden bg-stone-100 relative">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-baseline justify-between gap-1 mb-1">
                          <h4 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-900">
                            {prod.name}
                          </h4>
                          <span className="font-bold text-amber-800 text-base">₹{prod.price}</span>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {prod.prepTime}
                        </span>
                        <span className={`font-semibold ${isSelected ? 'text-amber-700' : 'text-stone-400'}`}>
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Customization & Customer Details Form */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-700">Step 2</span>
              <h3 className="font-serif text-2xl font-bold text-stone-900">Place Your Order</h3>
              <p className="text-stone-500 text-sm">Fill in your delivery address and instructions for our artisan baker.</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product and Quantity row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Product
                  </label>
                  <select
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 font-medium bg-stone-50/50"
                  >
                    <option value="Birthday Cake">Birthday Cake (₹850)</option>
                    <option value="Chocolate Cake">Chocolate Cake (₹950)</option>
                    <option value="Cupcake">Cupcake (₹120)</option>
                    <option value="Cookies">Cookies (₹250)</option>
                    <option value="Red Velvet Cake">Red Velvet Cake (₹890)</option>
                    <option value="Blueberry Cheesecake">Blueberry Cheesecake (₹1,100)</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50/50 p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityAdjust(-1)}
                      className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 transition-colors disabled:opacity-40"
                      disabled={form.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      className="w-full text-center font-bold text-stone-900 bg-transparent border-0 focus:ring-0 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityAdjust(1)}
                      className="w-10 h-10 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Eggless Option Toggle */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md border-2 border-emerald-600 p-0.5 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900">100% Eggless Vegetarian Preparation</span>
                    <p className="text-xs text-stone-600">Baked with organic yogurt, condensed milk, and flaxseed emulsion (+₹50/item)</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isEggless"
                    checked={form.isEggless}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Customer Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Maya Krishnan"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 bg-white placeholder:text-stone-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 bg-white placeholder:text-stone-400 text-sm"
                  />
                </div>
              </div>

              {/* Customization Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    Customization & Kitchen Notes
                  </label>
                  <span className="text-[11px] text-stone-400">Message on cake, colors, allergies</span>
                </div>
                <textarea
                  name="customization"
                  rows={3}
                  value={form.customization}
                  onChange={handleChange}
                  placeholder="Example: Chocolate cake, red flowers, Happy Birthday Maya in cursive..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 bg-white placeholder:text-stone-400 text-sm leading-relaxed"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-stone-500 font-semibold self-center mr-1">Quick Add:</span>
                  {CUSTOMIZATION_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyCustomizationPreset(sug)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 border border-stone-200 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.deliveryDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    Preferred Delivery Slot
                  </label>
                  <select
                    name="deliverySlot"
                    value={form.deliverySlot}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 bg-white text-sm"
                  >
                    {DELIVERY_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  rows={2}
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Apartment, Street Name, Landmark, City & Pincode"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-stone-900 bg-white placeholder:text-stone-400 text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white font-bold text-base shadow-lg shadow-amber-900/20 hover:from-amber-800 hover:to-amber-950 focus:ring-4 focus:ring-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Placing Order with Kitchen...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Place Order • ₹{estimatedTotal}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Sticky Order Summary & Baker View Teaser */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Order Summary Receipt Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600"></div>

            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-lg">Order Summary</h4>
                <p className="text-xs text-stone-500">Sweet Home Bakery Cart</p>
              </div>
              <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-sm">
                🍰
              </span>
            </div>

            {/* Selected Item Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-stone-900">{form.product}</span>
                  <div className="text-xs text-stone-500">
                    ₹{basePrice} × {form.quantity}
                  </div>
                </div>
                <span className="font-bold text-stone-900">₹{basePrice * form.quantity}</span>
              </div>

              {form.isEggless && (
                <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span>Eggless Preparation (+₹50 ea)</span>
                  <span className="font-semibold">+₹{egglessPrice}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Handcrafted Packaging</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Birthday Candles & Knife</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-semibold">FREE Standard</span>
              </div>
            </div>

            {/* Total Box */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-stone-200">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Grand Total</span>
                  <p className="text-[11px] text-stone-400">All taxes & packaging included</p>
                </div>
                <span className="font-serif text-3xl font-bold text-amber-900">
                  ₹{estimatedTotal}
                </span>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Baked on delivery day</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Quality checked</span>
              </div>
            </div>
          </div>

          {/* Switch to Baker Panel Card */}
          <div className="bg-gradient-to-br from-amber-900 to-stone-900 rounded-3xl p-6 text-white shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                👩‍🍳
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-base">Baker Kitchen Portal</h4>
                <p className="text-xs text-amber-200/80">Manage queue & update baking status</p>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Need to fulfill orders or mark cakes as &ldquo;Baking&rdquo;, &ldquo;Ready&rdquo;, or &ldquo;Out for Delivery&rdquo;? Open the Baker Dashboard.
            </p>
            <button
              onClick={onGoToBaker}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Open Baker Management</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
