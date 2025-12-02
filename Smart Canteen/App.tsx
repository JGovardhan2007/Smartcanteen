import React, { useState, useEffect } from 'react';
import { UserRole, MenuItem, CartItem, Order, OrderStatus, ProductCategory, DietType } from './types';
import { MenuCard } from './components/MenuCard';
import { CartSidebar } from './components/CartSidebar';
import { SalesChart } from './components/SalesChart';
import { generateDailyMenu } from './services/geminiService';
import { auth, db, isFirebaseConfigured } from './lib/firebase';
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { 
  Utensils, 
  LayoutDashboard, 
  LogOut, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  User as UserIcon,
  Coffee,
  AlertTriangle,
  Settings,
  Database,
  ShieldCheck,
  Search,
  ChefHat,
  XCircle,
  Bell,
  Lock,
  ArrowRight,
  Hash,
  Ticket,
  Timer,
  History,
  Filter,
  ArrowLeft,
  PlusCircle,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Banknote,
  ChevronDown,
  ChevronUp,
  IceCream,
  Cookie,
  Leaf,
  AlertOctagon
} from 'lucide-react';

// --- Toast Notification Component ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300`}>
      {type === 'success' && <CheckCircle2 size={20} />}
      {type === 'error' && <AlertTriangle size={20} />}
      {type === 'info' && <Bell size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// --- Success Modal Component ---
interface SuccessModalProps {
    token: string;
    countdown: number;
    onLogoutNow: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ token, countdown, onLogoutNow }) => (
    <div className="fixed inset-0 z-[100] bg-green-600 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
        <div className="bg-white/10 backdrop-blur-lg p-12 rounded-3xl flex flex-col items-center text-center max-w-lg w-full mx-4 shadow-2xl">
            <div className="bg-white text-green-600 p-4 rounded-full mb-6 shadow-lg">
                <CheckCircle2 size={48} />
            </div>
            
            <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-green-100 mb-8 text-lg">Payment Successful</p>
            
            <div className="bg-white/20 p-6 rounded-2xl w-full mb-8 border border-white/30">
                <p className="text-sm uppercase tracking-widest font-bold text-green-100 mb-2">Your Token Number</p>
                <div className="text-7xl font-mono font-bold tracking-tighter drop-shadow-md">
                    {token}
                </div>
            </div>

            <div className="flex items-center gap-2 text-green-100 mb-8 bg-green-800/30 px-4 py-2 rounded-full">
                <Timer size={18} />
                <span>Redirecting to login in <span className="font-bold text-white w-6 inline-block text-center">{countdown}</span> seconds</span>
            </div>

            <button 
                onClick={onLogoutNow}
                className="bg-white text-green-700 font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-all shadow-lg active:scale-95 w-full"
            >
                Done / Next Student
            </button>
        </div>
    </div>
);

// --- Edit Item Modal ---
interface EditItemModalProps {
    item: Partial<MenuItem> | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<MenuItem>) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<MenuItem>>({
        name: '',
        description: '',
        price: 0,
        category: ProductCategory.MAIN,
        dietType: 'VEG',
        imageUrl: '',
        isAvailable: true
    });

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                category: ProductCategory.MAIN,
                dietType: 'VEG',
                imageUrl: '',
                isAvailable: true
            });
        }
    }, [item, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{item?.id ? 'Edit Item' : 'Add New Item'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea 
                                required
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
                             <select 
                                value={formData.dietType}
                                onChange={e => setFormData({...formData, dietType: e.target.value as DietType})}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="VEG">Veg</option>
                                <option value="NON-VEG">Non-Veg</option>
                            </select>
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value as ProductCategory})}
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                {Object.values(ProductCategory).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Delete Confirmation Modal ---
interface DeleteModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 m-4 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                        <AlertOctagon className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Item?</h2>
                    <p className="text-gray-500 mb-6">
                        Are you sure you want to delete <span className="font-bold text-gray-800">{item.name}</span>? 
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Skeleton Loading Component ---
const MenuSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-4 flex-1 flex flex-col space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="h-16 bg-gray-200 rounded w-full animate-pulse" />
      <div className="mt-auto flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
    </div>
  </div>
);

function App() {
  // --- Setup Check ---
  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Settings className="text-orange-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Setup Required</h1>
              <p className="text-gray-500">Connect your Firebase project to start.</p>
            </div>
          </div>
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-start gap-2">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            <p>Please update <code>lib/firebase.ts</code> with your config keys.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.NONE);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  const [showVegOnly, setShowVegOnly] = useState(false);
  
  // Login Form State
  const [loginTab, setLoginTab] = useState<'student' | 'admin'>('student');
  const [studentName, setStudentName] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@smartcanteen.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  
  // Success & Kiosk Mode State
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const [logoutCountdown, setLogoutCountdown] = useState<number>(0);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Admin View State
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'history'>('dashboard');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [showAllActiveOrders, setShowAllActiveOrders] = useState(false);
  
  // Inventory Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // --- Effects ---

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (firebaseUser.email && firebaseUser.email.includes('admin')) {
            setCurrentUserRole(UserRole.ADMIN);
        } else {
            setCurrentUserRole(UserRole.STUDENT);
        }
      } else {
        setCurrentUserRole(UserRole.NONE);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Menu Listener
  useEffect(() => {
    setLoadingMenu(true);
    const q = collection(db, 'menu');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      // Sort items alphabetically by name
      menuItems.sort((a, b) => a.name.localeCompare(b.name));
      setMenu(menuItems);
      setLoadingMenu(false);
    });
    return () => unsubscribe();
  }, []);

  // Orders Listener
  useEffect(() => {
    if (currentUserRole === UserRole.NONE) return;

    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        if (currentUserRole === UserRole.ADMIN) {
          setOrders(allOrders);
        } else if (currentUserRole === UserRole.STUDENT && user) {
            setOrders(allOrders.filter(o => o.studentId === user.uid));
        }
      });

    return () => unsubscribe();
  }, [currentUserRole, user]);

  // Logout Timer
  useEffect(() => {
    let timer: any;
    if (successToken && logoutCountdown > 0) {
        timer = setInterval(() => {
            setLogoutCountdown((prev) => prev - 1);
        }, 1000);
    } else if (successToken && logoutCountdown === 0) {
        handleLogout();
    }
    return () => clearInterval(timer);
  }, [successToken, logoutCountdown]);

  // --- Handlers ---

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (!studentName.trim() || !studentRollNo.trim()) {
        setAuthError('Name and Student ID are required.');
        setAuthLoading(false);
        return;
    }

    try {
        const userCredential = await signInAnonymously(auth);
        const displayName = `${studentName.trim()} (ID: ${studentRollNo.trim()})`;
        
        if (userCredential.user) {
            await updateProfile(userCredential.user, {
                displayName: displayName
            });
            setUser({ ...userCredential.user, displayName: displayName });
        }
        
        showToast(`Welcome, ${displayName}!`, 'success');
    } catch (error: any) {
        console.error("Login failed", error);
        setAuthError(error.message);
        showToast('Login failed. Check console.', 'error');
    } finally {
        setAuthLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    if (!adminEmail || !adminPassword) {
        setAuthError('Please enter both email and password.');
        setAuthLoading(false);
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        showToast('Welcome, Admin!', 'success');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
                showToast('Admin account created & logged in', 'success');
            } catch (createError: any) {
                setAuthError("Login failed: " + createError.message);
            }
        } else {
            setAuthError("Login failed: " + error.message);
        }
    } finally {
        setAuthLoading(false);
    }
  };
  
  const handleLogout = async () => {
    setIsCartOpen(false);
    setCart([]);
    setSuccessToken(null); 
    setAdminViewMode('dashboard'); 
    
    await signOut(auth);
    setStudentName('');
    setStudentRollNo('');
    showToast('Ready for next student', 'info');
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        showToast(`Added another ${item.name}`, 'success');
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      showToast(`${item.name} added to tray`, 'success');
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const placeOrder = async (paymentMethod: string) => {
    if (!user) return;
    setIsProcessingOrder(true);

    try {
        const tokenNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
        const rollMatch = user.displayName?.match(/\(ID: (.*)\)/);
        const rollNo = rollMatch ? rollMatch[1] : '---';

        const orderData: Omit<Order, 'id'> = {
            studentId: user.uid,
            studentName: user.displayName || 'Anonymous',
            rollNo: rollNo,
            tokenNumber: tokenNumber,
            items: cart,
            totalAmount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
            status: OrderStatus.PENDING,
            timestamp: Date.now()
        };

        await addDoc(collection(db, 'orders'), orderData);
        
        setCart([]);
        setIsCartOpen(false);
        setIsProcessingOrder(false);
        
        setSuccessToken(tokenNumber);
        setLogoutCountdown(10);
        
    } catch (error) {
        console.error("Error placing order", error);
        showToast("Failed to place order. Try again.", 'error');
        setIsProcessingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
        showToast(`Order status updated to ${status}`, 'info');
    } catch (error) {
        console.error("Error updating status", error);
        showToast("Failed to update status", 'error');
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
        const itemRef = doc(db, 'menu', item.id);
        await updateDoc(itemRef, { isAvailable: !item.isAvailable });
        showToast(`${item.name} is now ${!item.isAvailable ? 'Available' : 'Sold Out'}`, 'info');
    } catch (error) {
        console.error("Error updating item", error);
        showToast("Failed to update item availability", 'error');
    }
  };

  // Logic to populate the comprehensive list if needed
  const initializeDefaultMenu = async () => {
    if(!window.confirm("This will replace all current menu items with the default 40 items. Continue?")) return;
    
    setIsGenerating(true);
    showToast("Initializing database...", 'info');
    try {
        const newItems = await generateDailyMenu(); // Now returns the static list
        const batch = writeBatch(db);
        
        // Delete existing
        menu.forEach(item => {
            const ref = doc(db, 'menu', item.id);
            batch.delete(ref);
        });
        
        // Add new
        newItems.forEach(item => {
            const ref = doc(db, 'menu', item.id); 
            batch.set(ref, item);
        });
        
        await batch.commit();
        showToast("Inventory initialized successfully!", 'success');
    } catch (error) {
        console.error("Initialization failed", error);
        showToast("Failed to update menu database.", 'error');
    } finally {
        setIsGenerating(false);
    }
  };

  // CRUD Handlers for Menu
  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
      setEditingItem(null); // Null means add mode
      setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
      setItemToDelete(item);
  };

  const confirmDelete = async () => {
      if (!itemToDelete) return;
      try {
          await deleteDoc(doc(db, 'menu', itemToDelete.id));
          showToast(`${itemToDelete.name} deleted`, 'success');
          setItemToDelete(null);
      } catch (err) {
          console.error("Delete error:", err);
          showToast("Failed to delete item. Check console.", 'error');
      }
  };

  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
      try {
          // Generate an image URL if none provided or name changed
          let finalImageUrl = itemData.imageUrl;
          if (!finalImageUrl || (itemData.name && !finalImageUrl.includes(itemData.name.replace(/[^a-zA-Z0-9 ]/g, '')))) {
               const cleanName = (itemData.name || '').replace(/[^a-zA-Z0-9 ]/g, ''); 
               finalImageUrl = `https://image.pollinations.ai/prompt/delicious%20indian%20food%20${encodeURIComponent(cleanName)}%20close%20up%20high%20quality?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
          }

          if (editingItem && editingItem.id) {
              // Update
              await updateDoc(doc(db, 'menu', editingItem.id), {
                  ...itemData,
                  imageUrl: finalImageUrl
              });
              showToast("Item updated successfully", 'success');
          } else {
              // Create
              await addDoc(collection(db, 'menu'), {
                  ...itemData,
                  imageUrl: finalImageUrl,
                  isAvailable: true
              });
              showToast("New dish added to inventory", 'success');
          }
          setIsEditModalOpen(false);
      } catch (err) {
          console.error(err);
          showToast("Failed to save item", 'error');
      }
  };

  const getFilteredMenu = () => {
    return menu.filter(item => {
        const matchesCategory = activeTab === 'All' || item.category === activeTab;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Dynamic Veg Detection for old items
        const isVeg = item.dietType === 'VEG' || 
          (!item.dietType && !['chicken', 'egg', 'non-veg', 'mutton', 'fish', 'prawn', 'beef', 'pork'].some(k => item.name.toLowerCase().includes(k)));
        
        const matchesDiet = !showVegOnly || isVeg;

        return matchesCategory && matchesSearch && matchesDiet;
    });
  };

  const getSalesData = () => {
    const data: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status !== OrderStatus.CANCELLED) {
        const date = new Date(order.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        data[date] = (data[date] || 0) + order.totalAmount;
      }
    });
    
    if (Object.keys(data).length === 0) return [];
    
    return Object.entries(data).map(([name, revenue]) => ({ 
        name, 
        revenue, 
        orders: orders.filter(o => new Date(o.timestamp).toLocaleDateString('en-US', { weekday: 'short' }) === name).length 
    }));
  };

  // Helper for admin views
  const getActiveOrders = () => {
    return orders.filter(o => [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY].includes(o.status));
  };
  
  const getHistoryOrders = () => {
      return orders.filter(o => {
          const matchesSearch = 
            (o.tokenNumber || '').toLowerCase().includes(historySearch.toLowerCase()) ||
            (o.studentName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
            (o.rollNo || '').toLowerCase().includes(historySearch.toLowerCase());
            
          const matchesFilter = historyFilter === 'ALL' || o.status === historyFilter;
          return matchesSearch && matchesFilter;
      });
  };

  if (authLoading && !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-orange-500" size={48} />
        </div>
    );
  }

  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="bg-orange-50 p-6 text-center border-b border-orange-100">
             <div className="inline-block bg-orange-100 p-3 rounded-full mb-3">
                <Utensils size={32} className="text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Canteen</h1>
            <p className="text-gray-500 text-sm">Skip the queue. Eat fresh.</p>
        </div>
        <div className="flex border-b">
            <button 
                className={`flex-1 py-3 text-sm font-medium transition-colors ${loginTab === 'student' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setLoginTab('student')}
            >
                Student
            </button>
            <button 
                className={`flex-1 py-3 text-sm font-medium transition-colors ${loginTab === 'admin' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setLoginTab('admin')}
            >
                Admin
            </button>
        </div>
        <div className="p-8">
            {authError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4 animate-in slide-in-from-top-2">
                    <AlertTriangle size={16} className="shrink-0"/>
                    {authError}
                </div>
            )}
            {loginTab === 'student' ? (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="e.g. Alex Smith"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID <span className="text-red-500">*</span></label>
                        <input 
                            type="text"
                            value={studentRollNo}
                            onChange={(e) => setStudentRollNo(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="e.g. 10452"
                            required
                        />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 flex items-center justify-center gap-2">
                        {authLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />} Start Ordering
                    </button>
                </form>
            ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="admin@school.edu"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center gap-2">
                        {authLoading ? <Loader2 className="animate-spin" size={20} /> : <LayoutDashboard size={20} />} Login to Dashboard
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );

  const renderStudentView = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg"><Utensils className="text-orange-600" size={20} /></div>
            <div className="hidden sm:block">
                <h1 className="font-bold text-xl tracking-tight text-gray-900">Smart Canteen</h1>
                {user?.displayName && <p className="text-xs text-gray-500">Hi, {user.displayName}</p>}
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-4 hidden md:flex items-center gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search for food..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
             </div>
             
             {/* Desktop Veg Toggle */}
             <button 
                onClick={() => setShowVegOnly(!showVegOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${showVegOnly ? 'bg-green-100 text-green-700 ring-2 ring-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
                <Leaf size={16} /> Veg Only
             </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <ShoppingCart size={20} className="text-gray-700" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
            <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-gray-900">Cancel</button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 md:hidden flex gap-2">
            <input type="text" placeholder="Search for food..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-4 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
             {/* Mobile Veg Toggle */}
             <button 
                onClick={() => setShowVegOnly(!showVegOnly)}
                className={`flex shrink-0 items-center justify-center w-12 rounded-lg transition-all ${showVegOnly ? 'bg-green-100 text-green-700 ring-2 ring-green-600' : 'bg-white border border-gray-200 text-gray-600'}`}
             >
                <Leaf size={20} />
             </button>
        </div>
        
        {/* Category Tabs with Icons */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-2">
            <button onClick={() => setActiveTab('All')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${activeTab === 'All' ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                <Utensils size={16} /> All Items
            </button>
            <button onClick={() => setActiveTab(ProductCategory.MAIN)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${activeTab === ProductCategory.MAIN ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                <ChefHat size={16} /> Main Course
            </button>
             <button onClick={() => setActiveTab(ProductCategory.SNACK)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${activeTab === ProductCategory.SNACK ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                <Cookie size={16} /> Snacks
            </button>
            <button onClick={() => setActiveTab(ProductCategory.DRINK)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${activeTab === ProductCategory.DRINK ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                <Coffee size={16} /> Drinks
            </button>
             <button onClick={() => setActiveTab(ProductCategory.DESSERT)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${activeTab === ProductCategory.DESSERT ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}>
                <IceCream size={16} /> Desserts
            </button>
        </div>

        {loadingMenu ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[1, 2, 3, 4, 5, 6].map(n => <MenuSkeleton key={n} />)}</div> : 
        getFilteredMenu().length === 0 ? 
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">No items found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
            </div> : 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">{getFilteredMenu().map(item => <MenuCard key={item.id} item={item} onAddToCart={addToCart} />)}</div>}
      </main>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={removeFromCart} onPlaceOrder={placeOrder} isProcessing={isProcessingOrder} />
      {successToken && <SuccessModal token={successToken} countdown={logoutCountdown} onLogoutNow={handleLogout} />}
    </div>
  );

  const renderAdminHistory = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => setAdminViewMode('dashboard')} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} className="text-gray-600"/></button>
                    <h1 className="font-bold text-xl tracking-tight text-gray-900">Order History</h1>
                </div>
            </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                   <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by ID, Name or Token..." 
                            value={historySearch} 
                            onChange={(e) => setHistorySearch(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
                        />
                   </div>
                   <div className="flex gap-2">
                        {(['ALL', OrderStatus.COMPLETED, OrderStatus.CANCELLED] as const).map(status => (
                            <button 
                                key={status}
                                onClick={() => setHistoryFilter(status)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${historyFilter === status ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                            >
                                {status === 'ALL' ? 'All Orders' : status}
                            </button>
                        ))}
                   </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Token</th>
                                <th className="px-4 py-3">Student ID</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {getHistoryOrders().length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found matching your criteria.</td></tr>
                            ) : (
                                getHistoryOrders().map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-gray-700">{order.tokenNumber}</td>
                                        <td className="px-4 py-3 text-gray-600">{order.rollNo || 'N/A'}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{order.studentName}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">₹{order.totalAmount.toFixed(0)}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(order.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                                order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
  );

  const activeOrders = getActiveOrders();
  const visibleActiveOrders = showAllActiveOrders ? activeOrders : activeOrders.slice(0, 5);
  const visibleInventory = showAllInventory ? menu : menu.slice(0, 5);

  const renderAdminDashboard = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-gray-900 p-2 rounded-lg"><LayoutDashboard className="text-white" size={20} /></div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight text-gray-900">Admin Dashboard</h1>
                    <p className="text-xs text-gray-500">Overview & Controls</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setAdminViewMode('history')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <History size={16} /> History
                </button>
                <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                    <p className="text-2xl font-bold text-gray-900">₹{getSalesData().reduce((acc, curr) => acc + curr.revenue, 0).toFixed(0)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full"><Banknote className="text-green-600" size={24} /></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Active Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full"><Clock className="text-orange-600" size={24} /></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{menu.length}</p>
                </div>
                 <div className="bg-blue-100 p-3 rounded-full"><Database className="text-blue-600" size={24} /></div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Orders Column */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="text-orange-500" size={18} /> Active Orders
                    </h2>
                    <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {activeOrders.length} Pending
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-2">Token</th>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Items</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                             {visibleActiveOrders.length === 0 ? (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No active orders.</td></tr>
                            ) : (
                                visibleActiveOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-mono font-bold text-gray-900">{order.tokenNumber}</div>
                                            <div className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                         <td className="px-4 py-3 text-gray-600 font-medium">
                                            {order.rollNo || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="text-gray-700 flex justify-between text-xs">
                                                        <span>{item.name}</span>
                                                        <span className="font-semibold text-gray-400">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-1 border-t mt-1 font-bold text-gray-900 text-xs text-right">
                                                    ₹{order.totalAmount}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right space-y-2">
                                            {order.status === OrderStatus.PENDING && (
                                                <>
                                                    <button onClick={() => updateOrderStatus(order.id, OrderStatus.PREPARING)} className="w-full bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 text-xs font-medium border border-blue-200 transition-colors">
                                                        Start Prep
                                                    </button>
                                                    <button onClick={() => updateOrderStatus(order.id, OrderStatus.CANCELLED)} className="w-full bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 text-xs font-medium border border-red-200 transition-colors">
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {order.status === OrderStatus.PREPARING && (
                                                <button onClick={() => updateOrderStatus(order.id, OrderStatus.READY)} className="w-full bg-orange-50 text-orange-600 px-3 py-1 rounded hover:bg-orange-100 text-xs font-medium border border-orange-200 transition-colors">
                                                    Mark Ready
                                                </button>
                                            )}
                                            {order.status === OrderStatus.READY && (
                                                <button onClick={() => updateOrderStatus(order.id, OrderStatus.COMPLETED)} className="w-full bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100 text-xs font-medium border border-green-200 transition-colors">
                                                    Complete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                 {activeOrders.length > 5 && (
                    <button 
                        onClick={() => setShowAllActiveOrders(!showAllActiveOrders)}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-medium border-t flex items-center justify-center gap-1 transition-colors"
                    >
                        {showAllActiveOrders ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View All ({activeOrders.length})</>}
                    </button>
                )}
            </div>

            {/* Inventory Column */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                 <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <ChefHat className="text-gray-600" size={18} /> Inventory Control
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={initializeDefaultMenu} disabled={isGenerating} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors flex items-center gap-1" title="Reset to default menu">
                            {isGenerating ? <Loader2 className="animate-spin" size={12}/> : <RefreshCw size={12}/>} Reset
                        </button>
                        <button onClick={handleAddClick} className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded transition-colors flex items-center gap-1 shadow-sm">
                            <PlusCircle size={12}/> Add Item
                        </button>
                    </div>
                </div>
                
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                             <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 w-20">Price</th>
                                <th className="px-4 py-2 text-right">Stock & Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                             {visibleInventory.length === 0 ? (
                                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Inventory empty. Click "Reset" to load defaults.</td></tr>
                             ) : (
                                 visibleInventory.map(item => {
                                     // Smart fallback: check tag OR name if tag is missing
                                     const isVeg = item.dietType === 'VEG' || 
                                        (!item.dietType && !['chicken', 'egg', 'non-veg', 'mutton', 'fish', 'prawn', 'beef', 'pork'].some(k => item.name.toLowerCase().includes(k)));

                                     return (
                                     <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.isAvailable ? 'bg-red-50/50' : ''}`}>
                                        <td className="px-4 py-2 flex items-center gap-2">
                                            {isVeg ? (
                                                <div className="w-3 h-3 border border-green-600 p-0.5 flex items-center justify-center shrink-0" title="Veg">
                                                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                                </div>
                                            ) : (
                                                <div className="w-3 h-3 border border-red-600 p-0.5 flex items-center justify-center shrink-0" title="Non-Veg">
                                                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600"></div>
                                                </div>
                                            )}
                                            <div>
                                                <div className={`font-medium ${!item.isAvailable ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.name}</div>
                                                <div className="text-xs text-gray-400">{item.category}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 font-mono text-gray-600">₹{item.price}</td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleItemAvailability(item); }}
                                                    className={`p-1.5 rounded-md transition-colors ${item.isAvailable ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                                    title={item.isAvailable ? "Mark Sold Out" : "Mark Available"}
                                                >
                                                    {item.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                     </tr>
                                 )})
                             )}
                        </tbody>
                    </table>
                 </div>
                 {menu.length > 5 && (
                    <button 
                        onClick={() => setShowAllInventory(!showAllInventory)}
                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-medium border-t flex items-center justify-center gap-1 transition-colors"
                    >
                        {showAllInventory ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View All ({menu.length})</>}
                    </button>
                )}
             </div>
        </div>
        
        {/* Sales Chart Section */}
        <div className="mt-8">
            <SalesChart data={getSalesData()} />
        </div>
      </main>

      <EditItemModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
      />

      <DeleteModal 
        isOpen={!!itemToDelete}
        item={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {currentUserRole === UserRole.NONE && renderLogin()}
      {currentUserRole === UserRole.STUDENT && renderStudentView()}
      {currentUserRole === UserRole.ADMIN && (
          adminViewMode === 'dashboard' ? renderAdminDashboard() : renderAdminHistory()
      )}
    </>
  );
}

export default App;