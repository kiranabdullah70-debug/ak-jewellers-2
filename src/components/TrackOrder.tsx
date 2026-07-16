import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('my_orders') || '[]');
    setRecentOrders(stored);
  }, []);

  const fetchOrder = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    setOrderId(idToFetch); // keep input in sync
    try {
      const docRef = doc(db, 'orders', idToFetch.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder(docSnap.data());
      } else {
        setError('Order not found. Please verify your Order ID and try again.');
      }
    } catch (err) {
      setError('Could not retrieve order. Please verify your Order ID.');
    }
    setLoading(false);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  return (
    <div className="min-h-[70vh] bg-neutral-100 py-20 border-b border-neutral-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-center mb-8 text-neutral-900">My Orders</h1>
        <div className="bg-white p-8 sm:p-12 shadow-sm border border-neutral-200 text-center mb-8">
           <form onSubmit={handleTrack} className="max-w-md mx-auto flex flex-col items-center">
             <label className="block text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wider">Track with Order ID</label>
             <input 
               type="text" 
               value={orderId} 
               onChange={(e) => setOrderId(e.target.value)} 
               required 
               placeholder="e.g. j7XyP..." 
               className="w-full border-2 border-neutral-200 px-4 py-4 mb-6 text-center font-mono tracking-[0.2em] text-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-300" 
             />
             <button disabled={loading} className="w-full bg-neutral-900 text-white font-medium py-4 hover:bg-black transition-colors disabled:opacity-50 tracking-wide">
               {loading ? 'Searching Details...' : 'Check Status'}
             </button>
           </form>
           
           {recentOrders.length > 0 && (
             <div className="mt-8 pt-8 border-t border-neutral-100 max-w-md mx-auto">
               <p className="text-sm font-semibold text-neutral-500 mb-4 uppercase tracking-wider text-left">Your Recent Orders</p>
               <div className="flex flex-col gap-2">
                 {recentOrders.map(id => (
                   <button 
                     key={id} 
                     type="button"
                     onClick={() => fetchOrder(id)}
                     className="text-left px-4 py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 font-mono text-sm tracking-widest transition-colors flex justify-between items-center"
                   >
                     <span>{id}</span>
                     <span className="text-xs font-sans font-medium text-neutral-500 uppercase tracking-widest">View Order</span>
                    </button>
                 ))}
               </div>
             </div>
           )}
           {error && <p className="text-red-600 mt-6 font-medium px-4 py-3 bg-red-50 border border-red-100">{error}</p>}
        </div>

        {order && (
           <div className="bg-white p-8 sm:p-10 shadow-sm border border-neutral-200">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-neutral-200 gap-6">
               <div>
                  <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-1">Order Details For:</p>
                  <p className="font-display font-bold text-2xl text-neutral-900">{order.customerInfo.name}</p>
                  <p className="text-neutral-500 mt-1">{order.customerInfo.phone}</p>
               </div>
               <div className="text-left sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
                  <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-2">Order Total:</p>
                  <p className="font-display font-bold text-xl text-neutral-900">Rs. {order.total}</p>
               </div>
             </div>

             {/* Order Status Timeline */}
             <div className="mb-12">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -translate-y-1/2 hidden sm:block"></div>
                  <div className="absolute top-1/2 left-0 h-1 bg-neutral-900 -translate-y-1/2 hidden sm:block transition-all duration-500" 
                    style={{ width: order.status === 'completed' ? '100%' : order.status === 'shipped' ? '66%' : order.status === 'confirmed' ? '33%' : '0%' }}>
                  </div>
                  
                  <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                     {/* Step 1 */}
                     <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${order.status !== 'cancelled' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-400 border-neutral-200'}`}>1</div>
                        <div className="sm:text-center">
                           <p className="font-bold text-neutral-900">Order Placed</p>
                        </div>
                     </div>
                     {/* Step 2 */}
                     <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${(order.status === 'confirmed' || order.status === 'completed' || order.status === 'shipped') ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-400 border-neutral-200'}`}>2</div>
                        <div className="sm:text-center">
                           <p className={`font-bold ${order.status === 'confirmed' || order.status === 'completed' || order.status === 'shipped' ? 'text-neutral-900' : 'text-neutral-400'}`}>In Progress</p>
                        </div>
                     </div>
                     {/* Step 3 */}
                     <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${(order.status === 'completed' || order.status === 'shipped') ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-400 border-neutral-200'}`}>3</div>
                        <div className="sm:text-center">
                           <p className={`font-bold ${order.status === 'completed' || order.status === 'shipped' ? 'text-neutral-900' : 'text-neutral-400'}`}>Shipped</p>
                        </div>
                     </div>
                     {/* Step 4 */}
                     <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${order.status === 'completed' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-400 border-neutral-200'}`}>4</div>
                        <div className="sm:text-center">
                           <p className={`font-bold ${order.status === 'completed' ? 'text-neutral-900' : 'text-neutral-400'}`}>Completed</p>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
             
             <h3 className="font-display font-bold text-xl mb-6 text-neutral-900">Items Ordered</h3>
             <ul className="space-y-4">
                {order.items.map((item: any, i: number) => (
                  <li key={i} className="flex gap-6 items-start bg-neutral-50 border border-neutral-100 p-4">
                    <img src={item.image} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-cover bg-neutral-200" />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-neutral-900 leading-tight mb-2">{item.name}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                         <div>
                            <p className="text-neutral-500 font-semibold mb-0.5">Quantity</p>
                            <p className="text-neutral-900 font-medium">{item.quantity}</p>
                         </div>
                         <div>
                            <p className="text-neutral-500 font-semibold mb-0.5">Customization</p>
                            <p className="text-neutral-900 font-bold bg-white px-2 py-0.5 border border-neutral-200 inline-block">{item.customization}</p>
                         </div>
                      </div>
                    </div>
                  </li>
                ))}
             </ul>
           </div>
        )}
      </div>
    </div>
  );
}
