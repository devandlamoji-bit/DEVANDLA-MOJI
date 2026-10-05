import React from 'react';
import { Cake, ChefHat, Search, Sparkles, Clock, Phone, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  currentTab: 'order' | 'baker' | 'track';
  onTabChange: (tab: 'order' | 'baker' | 'track') => void;
  activeOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
      {/* Top micro-bar */}
      <div className="bg-amber-900 text-amber-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Free celebration candle & knife with every cake order!</span>
            </span>
            <span className="hidden md:inline text-amber-300/40">•</span>
            <span className="hidden md:flex items-center gap-1 text-amber-200/90">
              <Clock className="w-3.5 h-3.5" />
              Fresh batches daily from 8:00 AM
            </span>
          </div>
          <div className="flex items-center gap-4 text-amber-200/90">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Direct Kitchen: +91 98765 43210
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => onTabChange('order')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 p-0.5 shadow-md shadow-amber-500/10 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#FFFDF9] rounded-[14px] flex items-center justify-center text-amber-900 font-serif text-2xl font-bold">
                🍰
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-none group-hover:text-amber-800 transition-colors">
                  Sweet Home Bakery
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Artisan Pastry
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">Fresh cakes made with love • Handcrafted daily</p>
            </div>
          </div>

          {/* Action Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/70 shadow-inner">
            <button
              onClick={() => onTabChange('order')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'order'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${currentTab === 'order' ? 'text-amber-600' : 'text-stone-400'}`} />
              <span>Customer Order</span>
            </button>

            <button
              onClick={() => onTabChange('baker')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'baker'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <ChefHat className="w-4 h-4 text-amber-200" />
              <span>Baker Management</span>
              {activeOrdersCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  currentTab === 'baker'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-amber-600 text-white'
                }`}>
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('track')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentTab === 'track'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Search className={`w-4 h-4 ${currentTab === 'track' ? 'text-amber-600' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">Track Order</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
