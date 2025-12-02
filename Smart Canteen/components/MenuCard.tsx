import React, { useState } from 'react';
import { MenuItem } from '../types';
import { Plus, Ban, ToggleLeft, ToggleRight, ImageOff, Pencil, Trash2, Flame, Star } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem) => void;
  isAdmin?: boolean;
  onToggleAvailability?: (item: MenuItem) => void;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ 
  item, 
  onAddToCart, 
  isAdmin = false,
  onToggleAvailability,
  onEdit,
  onDelete
}) => {
  const [imgError, setImgError] = useState(false);

  // Smart fallback logic for Veg/Non-Veg
  const isVeg = item.dietType === 'VEG' || 
    (!item.dietType && !['chicken', 'egg', 'non-veg', 'mutton', 'fish', 'prawn', 'beef', 'pork'].some(keyword => item.name.toLowerCase().includes(keyword)));

  // Smart detection for Spicy items
  const isSpicy = ['masala', 'peri peri', 'chilli', 'schezwan', 'spicy', 'tikka'].some(k => item.name.toLowerCase().includes(k) || item.description.toLowerCase().includes(k));

  // Mock Bestseller logic (Hardcoded popular Indian items for demo)
  const isBestseller = ['m1', 'm2', 's1', 's4', 'd1', 'd3'].includes(item.id);

  return (
    <div className={`bg-white rounded-xl shadow-sm transition-all duration-200 overflow-hidden border flex flex-col h-full group ${
      !item.isAvailable && !isAdmin ? 'opacity-60 grayscale' : 'hover:shadow-md border-gray-100'
    }`}>
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 bg-gray-100 w-full h-full">
            <ImageOff size={32} className="mb-2 opacity-50" />
            <span className="text-xs">Image not available</span>
          </div>
        )}
        
        {/* Badges Container */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {isVeg ? (
                <div className="bg-white/95 backdrop-blur-sm p-1 rounded shadow-sm border border-green-600 flex items-center justify-center w-6 h-6" title="Vegetarian">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                </div>
            ) : (
                 <div className="bg-white/95 backdrop-blur-sm p-1 rounded shadow-sm border border-red-600 flex items-center justify-center w-6 h-6" title="Non-Vegetarian">
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-red-600"></div>
                </div>
            )}
            
            {isSpicy && (
                <div className="bg-red-500 text-white p-1 rounded-full shadow-sm w-6 h-6 flex items-center justify-center" title="Spicy">
                    <Flame size={12} fill="currentColor" />
                </div>
            )}
        </div>

        {/* Bestseller Badge */}
        {isBestseller && item.isAvailable && (
             <div className="absolute top-2 left-2">
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> BESTSELLER
                </span>
             </div>
        )}

        {/* Admin Action Buttons Overlay */}
        {isAdmin && (
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onEdit?.(item)}
                    className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors shadow-md"
                    title="Edit Details"
                >
                    <Pencil size={14} />
                </button>
                <button 
                    onClick={() => onDelete?.(item)}
                    className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors shadow-md"
                    title="Delete Item"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        )}
        
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm transform -rotate-12 border-2 border-white shadow-lg">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col">
             <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.category}</span>
             <span className="text-xl font-bold text-gray-900">₹{item.price.toFixed(0)}</span>
          </div>
          
          {isAdmin ? (
            <button
              onClick={() => onToggleAvailability?.(item)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                item.isAvailable 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {item.isAvailable ? (
                <><ToggleRight size={18} /> In Stock</>
              ) : (
                <><ToggleLeft size={18} /> Sold Out</>
              )}
            </button>
          ) : (
            <button
              onClick={() => item.isAvailable && onAddToCart?.(item)}
              disabled={!item.isAvailable}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                item.isAvailable 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {item.isAvailable ? <><Plus size={18} /> Add</> : <><Ban size={18} /> N/A</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};