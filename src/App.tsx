import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import CartPage from "./pages/CartPage";
import { CartItem } from "./types";

function HomePage() {
  return (
    <div className="bg-[#fff8f0]">
      <header className="bg-[#d4af37] text-white text-center py-8">
        <h1 className="text-4xl font-display font-bold">AK JEWELLERS</h1>
        <p className="mt-2">Premium Customized Jewelry - Karachi</p>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 text-center">
            <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" className="w-full h-64 object-cover rounded" />
            <h3 className="font-bold mt-4 text-lg">Sarah Name Bracelet</h3>
            <p className="text-[#d4af37] font-bold text-xl">Rs. 2,499</p>
            <button className="mt-3 bg-[#d4af37] text-white px-6 py-2 rounded hover:bg-[#c09a2e]">Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const removeFromCart = (id: string) => setCart(cart.filter(i => i.cartId !== id));
  const updateQuantity = (id: string, qty: number) => setCart(cart.map(i => i.cartId === id ? {...i, quantity: qty} : i));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
      </Routes>
    </BrowserRouter>
  )
}
