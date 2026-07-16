import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Order, Category } from '../types';
import { LogOut, LogIn } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'categories' | 'settings'>('orders');
  const [siteSettings, setSiteSettings] = useState<{coverPhoto?: string}>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    import('firebase/firestore').then(({ getDoc, doc }) => {
      getDoc(doc(db, 'settings', 'site')).then(docSnap => {
        if (docSnap.exists()) {
          setSiteSettings(docSnap.data() as {coverPhoto?: string});
        }
      });
    });
  }, []);

  const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const coverPhoto = formData.get('coverPhoto') as string;
    try {
      await setDoc(doc(db, 'settings', 'site'), { coverPhoto }, { merge: true });
      setSiteSettings(prev => ({ ...prev, coverPhoto }));
      alert("Settings saved successfully.");
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("Error logging in");
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQ, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });

    const categoryQ = query(collection(db, 'categories'));
    const unsubCategories = onSnapshot(categoryQ, (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });

    return () => {
      unsubOrders();
      unsubCategories();
    };
  }, [user]);

  const handleUpdateOrderStatus = async (order: Order, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), { status });
      if (order.status === 'pending' && status === 'confirmed') {
        handleWhatsAppNotification(order);
      }
    } catch (e) {
      alert("Error updating order status.");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent, categoryId: string) => {
     e.preventDefault();
     const form = e.target as HTMLFormElement;
     const img = form.img.value;
     try {
       await setDoc(doc(db, 'categories', categoryId), { img }, { merge: true });
       alert("Category cover photo updated successfully!");
     } catch (err) {
       alert("Error updating category photo.");
     }
  };

  const handleWhatsAppNotification = (order: Order) => {
    let phone = order.customerInfo.phone.trim();
    if (phone.startsWith('03')) {
      phone = '923' + phone.substring(2);
    }

    const itemsStr = order.items.map(i => `${i.name} (Custom: ${i.customization})`).join(", ");
    
    const message = `Assalamualaikum ${order.customerInfo.name} 🎉

Aapka Order #${order.id} AK Jewellers me CONFIRM ho chuka hai.

Product: ${itemsStr}
Total: Rs ${order.total}
Advance: Rs. 200

✅ Aapka parcel 5 se 7 working days me aapke diye gaye address par deliver ho jayega.
Address: ${order.customerInfo.address}

Kisi bhi sawal ke liye rabta karein: 0303 2111925
Shukriya - AK Jewellers`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  if (authLoading) return <div className="py-20 text-center">Checking authorization...</div>;

  if (!user || user.email !== 'kiranabdullah70@gmail.com') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-neutral-50 px-4">
        <h1 className="text-3xl font-bold font-display text-neutral-900 mb-6">Admin Access</h1>
        <p className="text-neutral-600 mb-8 max-w-sm text-center">Please login with your authorized administrator account to manage store settings and orders.</p>
        <button onClick={handleLogin} className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 font-medium hover:bg-black transition-colors rounded-none">
          <LogIn size={20} /> Login with Google
        </button>
        {user && user.email !== 'kiranabdullah70@gmail.com' && (
          <p className="text-red-600 mt-6 font-medium text-center">Access denied for {user.email}. You are not authorized.</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold font-display text-neutral-900">Admin Dashboard</h1>
          <button onClick={() => { signOut(auth); navigate('/'); }} className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 font-medium hover:bg-black transition-colors rounded-none">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-6 mt-4 mb-8 border-b border-neutral-200">
           <button onClick={() => setActiveTab('orders')} className={`font-semibold pb-3 border-b-2 transition-colors ${activeTab === 'orders' ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent hover:text-neutral-900'}`}>Orders Management</button>
           <button onClick={() => navigate('/category/all')} className="font-semibold pb-3 text-neutral-500 hover:text-neutral-900 border-b-2 border-transparent">Manage Products (Go to Shop)</button>
           <button onClick={() => setActiveTab('settings')} className={`font-semibold pb-3 border-b-2 transition-colors ${activeTab === 'settings' ? 'text-neutral-900 border-neutral-900' : 'text-neutral-500 border-transparent hover:text-neutral-900'}`}>Site Settings</button>
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white p-4 sm:p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Total Orders Received ({orders.length})</h2>
              <div className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                {orders.filter(o => o.status === 'pending').length} Action Required
              </div>
            </div>
            
            {loading ? <p className="text-neutral-500 py-8 text-center">Loading orders...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="py-3 px-4 font-semibold text-neutral-900 whitespace-nowrap">Order ID</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900">Customer Details</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900">Status</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900">Total Bill</th>
                      <th className="py-3 px-4 font-semibold text-neutral-900">Items Ordered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 align-top">
                        <td className="py-4 px-4 font-mono text-xs text-neutral-500 select-all">{order.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-neutral-900 text-base">{order.customerInfo.name}</p>
                          <p className="text-neutral-600 font-medium">{order.customerInfo.phone}</p>
                          <p className="text-neutral-500 mt-1">{order.customerInfo.address}</p>
                          <p className="text-neutral-500">{order.customerInfo.city}</p>
                        </td>
                        <td className="py-4 px-4">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                            className={`block w-full mb-3 border px-3 py-2 text-sm font-semibold uppercase tracking-wider focus:outline-none focus:ring-1 ${
                               order.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                               order.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                               order.status === 'shipped' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                               order.status === 'completed' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleWhatsAppNotification(order)}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-3 rounded w-full transition-colors flex items-center justify-center gap-1"
                          >
                            Send WhatsApp Notification
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-neutral-900 text-base mb-1">Rs. {order.total}</p>
                          <p className="text-xs text-neutral-500 mb-2">Includes Rs. {order.shipping} shipping</p>
                          {order.status === 'pending' && (
                            <span className="inline-block bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mt-1">
                              Rs. 200 Advance Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-3">
                             {order.items.map((item, i) => (
                               <div key={i} className="flex gap-3 items-start bg-white border border-neutral-200 p-2 relative">
                                 <img src={item.image} alt="" className="w-12 h-12 object-cover bg-neutral-100" />
                                 <div>
                                   <p className="font-bold text-neutral-900 leading-tight">{item.quantity}x {item.name}</p>
                                   <div className="mt-1 bg-neutral-100 px-2 py-1 inline-block">
                                     <p className="text-xs text-neutral-600 font-mono">Custom: <span className="font-bold text-neutral-900">{item.customization}</span></p>
                                   </div>
                                 </div>
                               </div>
                             ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && <p className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-200 mt-4">No orders have been received yet.</p>}
              </div>
            )}
           </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white p-4 sm:p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Site Settings</h2>
            <form onSubmit={saveSettings} className="space-y-6 max-w-xl">
               <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Cover Photo URL (Homepage Herobanner)</label>
                  <input name="coverPhoto" defaultValue={siteSettings.coverPhoto || ""} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium text-neutral-600" placeholder="https://..." />
                  {siteSettings.coverPhoto && (
                     <div className="mt-4 border border-neutral-200 aspect-video overflow-hidden">
                       <img src={siteSettings.coverPhoto} alt="Preview" className="w-full h-full object-cover" />
                     </div>
                  )}
               </div>
               <button type="submit" className="bg-neutral-900 hover:bg-black text-white px-6 py-2 transition-colors font-medium">Save Settings</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
