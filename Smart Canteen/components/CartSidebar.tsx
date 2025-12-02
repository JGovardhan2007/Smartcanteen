import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, CreditCard, Banknote, Wallet } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onPlaceOrder: (paymentMethod: string) => void;
  isProcessing: boolean;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onPlaceOrder,
  isProcessing
}) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-orange-500" />
            <h2 className="font-bold text-xl text-gray-800">Checkout</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p>Your tray is empty.</p>
              <p className="text-sm">Go add some delicious food!</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-700">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-white border rounded-lg shadow-sm">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-gray-500 text-sm">₹{item.price.toFixed(0)} x {item.quantity}</p>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                        <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                        <button 
                            onClick={() => onRemove(item.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Payment Method</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'UPI' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200 text-gray-600'}`}
                  >
                    <Wallet size={24} className="mb-1" />
                    <span className="text-xs font-bold">UPI</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200 text-gray-600'}`}
                  >
                    <Banknote size={24} className="mb-1" />
                    <span className="text-xs font-bold">Cash</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CARD' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200 text-gray-600'}`}
                  >
                    <CreditCard size={24} className="mb-1" />
                    <span className="text-xs font-bold">Card</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t space-y-4">
          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total to Pay</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
          <button
            onClick={() => onPlaceOrder(paymentMethod)}
            disabled={items.length === 0 || isProcessing}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            {isProcessing ? 'Processing...' : `Pay & Place Order`}
          </button>
        </div>
      </div>
    </div>
  );
};