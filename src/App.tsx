import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
  Edit3,
  X,
  UploadCloud,
  Trash2,
  Check,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Truck,
  PackageCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { CartItem, Product } from "./types";
import heroJewelryImg from "./assets/images/hero_jewelry_1779902999485.png";
import BlogSection from "./components/BlogSection";
import ProductSection from "./components/ProductSection";
import AdminDashboard from "./components/AdminDashboard";
import TrackOrder from "./components/TrackOrder";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import {
  AboutUs,
  ContactUs,
  PrivacyPolicy,
  TermsConditions,
  RefundPolicy,
} from "./pages/InfoPages";
import { db, auth, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import { INITIAL_PRODUCTS } from "./data/products";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === 'kiranabdullah70@gmail.com';

  const addToCart = (
    product: Product,
    customization: string,
    quantity: number = 1,
  ) => {
    if (!customization.trim()) {
      alert(`Please fill the required field: ${product.customFieldLabel}`);
      return;
    }

    const cartId = `${product.id}-${customization}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartId === cartId);
      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { cartId, product, customization, quantity }];
    });
    navigate("/cart");
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-neutral-800 selection:text-white flex flex-col">
      <ScrollToTop />
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-wider text-neutral-900 border-2 border-neutral-900 p-1">
              AK
            </span>
            <span className="font-semibold text-neutral-900 tracking-widest hidden sm:block">
              JEWELLERS
            </span>
          </Link>

          <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/"
                className="hover:text-neutral-900 transition-colors font-semibold"
              >
                Home
              </Link>
              <Link
                to="/category/all"
                className="hover:text-neutral-900 transition-colors font-semibold"
              >
                Shop
              </Link>
              <Link
                to="/track"
                className="hover:text-neutral-900 transition-colors font-semibold"
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="bg-neutral-900 text-white px-3 py-1 text-xs hover:bg-black transition-colors font-bold uppercase tracking-wider"
                >
                  Admin Panel
                </Link>
              )}
              <a
                href="https://wa.me/923032111925"
                target="_blank"
                className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors"
              >
                <Phone size={16} /> 0303 2111925
              </a>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="bg-neutral-900 text-white px-2 py-1 text-[11px] hover:bg-black transition-colors font-bold uppercase tracking-wider md:hidden"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => navigate("/track")}
              className="relative p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors md:hidden"
            >
              <Search size={20} />
            </button>
            <Link
              to="/cart"
              className="relative p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors block"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-neutral-900 text-white text-[10px] flex items-center justify-center rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Routing Sections */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route
            path="/category/:categoryId"
            element={<CategoryPage addToCart={addToCart} />}
          />
          <Route
            path="/product/:productId"
            element={<ProductPage addToCart={addToCart} isAdmin={isAdmin} />}
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage cart={cart} clearCart={clearCart} />}
          />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-neutral-400 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-serif text-2xl mb-6 font-bold tracking-widest text-[#D4AF37]">
                AK JEWELLERS
              </h4>
              <p className="text-sm leading-relaxed max-w-sm mb-6">
                Premium customized jewelry crafted with love. We specialize in 18K gold-plated, water-proof, and tarnish-free pieces that tell your unique story.
              </p>
              <p className="text-sm">
                Based in Karachi, Pakistan.<br/>Nationwide secure delivery.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wider uppercase text-sm">Customer Care</h4>
              <ul className="text-sm space-y-4">
                <li>
                  <Link to="/about" className="hover:text-[#D4AF37] transition-colors">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact Us</Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-[#D4AF37] transition-colors">Refund & Exchange Policy</Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 tracking-wider uppercase text-sm">Connect With Us</h4>
              <ul className="text-sm space-y-4">
                <li>
                  <a href="https://www.instagram.com/muhammad7039abdullah/" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:text-white transition-colors flex items-center gap-3">
                    <Instagram size={18} /> Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=100083066025630" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:text-white transition-colors flex items-center gap-3">
                    <Facebook size={18} /> Facebook
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/923032111925" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:text-white transition-colors flex items-center gap-3">
                    <Phone size={18} /> 0303 2111925
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/923180686389" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:text-white transition-colors flex items-center gap-3">
                    <Phone size={18} /> 0318 0686389
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#222] flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} AK Jewellers. All rights reserved.</p>
            <div className="flex items-center gap-4 text-neutral-500">
              <span>Secure Checkout</span>
              <span>•</span>
              <span>Premium Quality</span>
              <span>•</span>
              <span>Nationwide Delivery</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function OrderSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <ShoppingCart size={40} />
      </div>
      <h1 className="font-display font-bold text-3xl text-neutral-900 mb-4">
        Order Placed Successfully!
      </h1>
      <p className="text-neutral-600 mb-8 max-w-md mx-auto">
        Thank you for your order! We have received your request and will contact you via WhatsApp shortly to confirm details. An email confirmation has also been sent to your provided address.
      </p>
      {orderId && (
        <div className="bg-neutral-100 p-6 mb-8 text-center border border-neutral-200 inline-block w-full max-w-md mx-auto">
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-2">
            Your Order ID
          </p>
          <p className="text-2xl font-mono font-bold text-neutral-900 tracking-widest select-all">
            {orderId}
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/"
          className="border-2 border-neutral-200 hover:border-neutral-300 text-neutral-900 py-3 px-8 font-medium transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/track"
          className="bg-neutral-900 hover:bg-black text-white py-3 px-8 font-medium transition-colors border-2 border-transparent"
        >
          View My Order
        </Link>
      </div>
    </div>
  );
}

function Home({

  addToCart,
}: {
  addToCart: (product: Product, custom: string, qty?: number) => void;
}) {
  const [categories, setCategories] = useState<
    { id: string; label: string; img: string }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [coverPhoto, setCoverPhoto] = useState(heroJewelryImg);

  const scrollLeft = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCategories = async () => {
      try {
        const dbCategories = await getDocs(collection(db, "categories"));
        const siteDoc = await getDoc(doc(db, "settings", "site"));
        if (siteDoc.exists() && siteDoc.data().coverPhoto) {
          setCoverPhoto(siteDoc.data().coverPhoto);
        }
        const defaults = [
          {
            id: "necklaces",
            label: "Necklaces",
            img: "https://images.unsplash.com/photo-1599643478514-4a4e06d538e1?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "bracelets",
            label: "Bracelets",
            img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "rings",
            label: "Rings",
            img: "https://images.unsplash.com/photo-1605100804763-247f67b454d6?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "accessories",
            label: "Cufflinks & Keychains",
            img: "https://images.unsplash.com/photo-1623998021446-45ef9e00028b?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "sets",
            label: "Sets & Policies",
            img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
          },
        ];

        if (dbCategories.empty) {
          setCategories(defaults);
        } else {
          setCategories(
            dbCategories.docs.map((d) => ({ id: d.id, ...d.data() }) as any),
          );
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setCategories([
          {
            id: "necklaces",
            label: "Necklaces",
            img: "https://images.unsplash.com/photo-1599643478514-4a4e06d538e1?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "bracelets",
            label: "Bracelets",
            img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "rings",
            label: "Rings",
            img: "https://images.unsplash.com/photo-1605100804763-247f67b454d6?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "accessories",
            label: "Cufflinks & Keychains",
            img: "https://images.unsplash.com/photo-1623998021446-45ef9e00028b?q=80&w=600&auto=format&fit=crop",
          },
          {
            id: "sets",
            label: "Sets & Policies",
            img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
          },
        ]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-neutral-900 text-white min-h-[60vh] flex items-center">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none z-10">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-neutral-900 to-black"></div>
        </div>
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={coverPhoto}
          alt="Luxury Custom Jewelry"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e: any) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-wide drop-shadow-sm">
              Your Story
              <br /> <span className="italic font-light">Beautifully Crafted.</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-200 font-light mb-10 max-w-lg leading-relaxed">
              Premium, high-quality personalized jewelry crafted with precision in Karachi, Pakistan.
            </p>
            <Link
              to="/category/all"
              className="inline-flex items-center gap-3 bg-white text-neutral-900 px-8 py-4 font-semibold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-xl"
            >
              Explore Collection <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pt-16 pb-8 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8">
            Shop by Category
          </h2>

          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-2 sm:-left-4 top-[calc(50%-8px)] -translate-y-1/2 z-10 bg-white shadow-md border border-neutral-200 rounded-full p-1.5 sm:p-2 hover:bg-neutral-50 transition-colors flex items-center justify-center"
            >
              <ChevronLeft
                size={18}
                className="text-neutral-600 sm:w-5 sm:h-5"
              />
            </button>

            <div
              ref={scrollRef}
              className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="shrink-0 bg-white hover:bg-neutral-50 transition-colors py-4 px-8 border border-neutral-200 hover:border-[#D4AF37] flex items-center justify-center"
                >
                  <span className="text-neutral-900 font-display font-semibold tracking-wider uppercase text-sm md:text-base">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>

            <button
              onClick={scrollRight}
              className="absolute right-2 sm:-right-4 top-[calc(50%-8px)] -translate-y-1/2 z-10 bg-white shadow-md border border-neutral-200 rounded-full p-1.5 sm:p-2 hover:bg-neutral-50 transition-colors flex items-center justify-center"
            >
              <ChevronRight
                size={18}
                className="text-neutral-600 sm:w-5 sm:h-5"
              />
            </button>
          </div>
        </div>
      </section>

      <ProductSection onAddToCart={addToCart} filterCategory="all" />

      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl font-bold text-center mb-16 text-neutral-900 tracking-wider"
          >
            The AK Jewellers Standard
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <ShieldCheck size={28} className="text-[#D4AF37]" />,
                title: "18K Gold Plated",
                desc: "Premium 18K Gold Plating for a radiant, long-lasting luxury finish that captures attention.",
              },
              {
                icon: <Droplets size={28} className="text-[#D4AF37]" />,
                title: "Water-Proof & Tarnish Free",
                desc: "Designed for everyday elegance. No black spots, no color fading—wear daily with confidence.",
              },
              {
                icon: <Truck size={28} className="text-[#D4AF37]" />,
                title: "Nationwide Secure Delivery",
                desc: "Handcrafted to perfection and securely delivered across Pakistan in 4-6 working days.",
              },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-neutral-100 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                <h3 className="font-display font-medium text-lg text-neutral-900 mb-3 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Packaging Display */}
      <section className="py-16 bg-[#FAFAFA] border-y border-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square lg:aspect-[4/3] bg-neutral-100"
            >
              <img 
                src="https://images.unsplash.com/photo-1549480112-be2a86f1837f?q=80&w=1200&auto=format&fit=crop" 
                alt="Premium Jewelry Packaging" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[10px] sm:border-[20px] border-white/20"></div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <PackageCheck size={40} className="text-[#D4AF37] mb-6" />
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-6 tracking-wide leading-tight">
                Premium Gift Packaging
              </h2>
              <p className="text-neutral-600 text-lg leading-relaxed mb-8">
                Elevate your jewelry with our signature luxury gift box. While standard secure packaging is included with every order, our hand-finished premium boxes offer an unforgettable unboxing experience, perfect for gifting.
              </p>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-900 uppercase tracking-widest">
                <span className="w-12 h-px bg-[#D4AF37]"></span>
                Available for Rs. 50
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <BlogSection />
    </>
  );
}

function CategoryPage({
  addToCart,
}: {
  addToCart: (product: Product, custom: string, qty?: number) => void;
}) {
  const { categoryId } = useParams<{ categoryId: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId]);

  return (
    <>
      <div className="bg-[#FAFAFA] py-16 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 capitalize uppercase tracking-widest">
            {categoryId === "all"
              ? "All Jewelry"
              : categoryId === "accessories"
                ? "Cufflinks & Keychains"
                : categoryId}
          </h1>
          <p className="text-neutral-600 mt-2">
            Explore our collection of custom{" "}
            {categoryId === "all"
              ? "jewelry"
              : categoryId === "accessories"
                ? "cufflinks & keychains"
                : categoryId}
            .
          </p>
        </div>
      </div>
      <ProductSection onAddToCart={addToCart} filterCategory={categoryId} />
    </>
  );
}

function ProductPage({
  addToCart,
  isAdmin,
}: {
  addToCart: (product: Product, custom: string, qty?: number) => void;
  isAdmin: boolean;
}) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [customValue, setCustomValue] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Gold");
  const [selectedChainSize, setSelectedChainSize] = useState("18 Inches - Standard Chain");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Editor states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCustomFieldLabel, setEditCustomFieldLabel] = useState("");
  const [editCustomFieldPlaceholder, setEditCustomFieldPlaceholder] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editGallery, setEditGallery] = useState<string[]>([]);
  const [editThumbnail1, setEditThumbnail1] = useState("");
  const [editThumbnail2, setEditThumbnail2] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [isThumb1Uploading, setIsThumb1Uploading] = useState(false);
  const [isThumb2Uploading, setIsThumb2Uploading] = useState(false);

  const openEditor = () => {
    if (!product) return;
    setEditName(product.name);
    setEditOriginalPrice(product.originalPrice);
    setEditSalePrice(product.salePrice);
    setEditDescription(product.description || "");
    setEditCategory(product.category || "necklaces");
    setEditCustomFieldLabel(product.customFieldLabel || "Enter Name");
    setEditCustomFieldPlaceholder(product.customFieldPlaceholder || "Sarah");
    setEditImage(product.image);
    setEditGallery(product.gallery || [product.image]);
    setEditThumbnail1(product.thumbnail1_url || "");
    setEditThumbnail2(product.thumbnail2_url || "");
    setIsEditorOpen(true);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", 0.8);
        setEditImage(dataUrl);
        setIsUploading(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }
    setIsGalleryUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", 0.8);
        setEditGallery((prev) => [...prev, dataUrl]);
        setIsGalleryUploading(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteGalleryImg = (indexToDelete: number) => {
    setEditGallery((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, thumbnailNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }
    
    if (thumbnailNumber === 1) setIsThumb1Uploading(true);
    else setIsThumb2Uploading(true);
    
    try {
      const storageRef = ref(storage, `thumbnails/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (thumbnailNumber === 1) setEditThumbnail1(url);
      else setEditThumbnail2(url);
    } catch (err: any) {
      console.error("Error uploading thumbnail", err);
      alert("Failed to upload image. " + err.message);
    } finally {
      if (thumbnailNumber === 1) setIsThumb1Uploading(false);
      else setIsThumb2Uploading(false);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      const updatedProduct: Product = {
        ...product,
        name: editName,
        originalPrice: Number(editOriginalPrice),
        salePrice: Number(editSalePrice),
        description: editDescription,
        category: editCategory,
        customFieldLabel: editCustomFieldLabel,
        customFieldPlaceholder: editCustomFieldPlaceholder,
        image: editImage,
        gallery: editGallery,
        thumbnail1_url: editThumbnail1,
        thumbnail2_url: editThumbnail2,
      };

      await setDoc(doc(db, "products", product.id), updatedProduct, { merge: true });
      setProduct(updatedProduct);
      setSelectedImage(editImage);
      setGalleryImages(editGallery);
      setIsEditorOpen(false);
      alert("Product changes and pictures saved successfully!");
    } catch (err: any) {
      console.error("Error saving product changes", err);
      alert("Failed to save changes. " + err.message);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const prod = docSnap.data() as Product;

          // Make sure image maps locally correctly
          const initProd = INITIAL_PRODUCTS.find((ip) => ip.id === prod.id);
          if (initProd && (prod.image?.includes("/assets/") || !prod.image || prod.image?.includes('regenerated_'))) {
            prod.image = initProd.image;
          }

          setProduct(prod);
          setSelectedImage(prod.image);

          // Build gallery
          let g = [];
          if (prod.gallery && prod.gallery.length > 0) {
            g = [...prod.gallery];
          } else {
            g.push(prod.image);
            if (prod.thumbnail1_url) g.push(prod.thumbnail1_url);
            else g.push("https://images.unsplash.com/photo-1599643478514-4a4e06d538e1?q=80&w=800&auto=format&fit=crop");
            
            if (prod.thumbnail2_url) g.push(prod.thumbnail2_url);
            else g.push("https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop");
            
            // Fill up to 4 images for the "SEE IT IN REAL LIFE" gallery
            const extraFallbacks = [
              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop"
            ];
            g = [...g, ...extraFallbacks];
          }
          
          setGalleryImages(g);

          const snapshot = await getDocs(collection(db, "products"));
          let targetCats: string[] = [];
          if (prod.category === "rings")
            targetCats = ["bracelets", "necklaces", "sets"];
          else if (prod.category === "bracelets")
            targetCats = ["necklaces", "rings", "sets"];
          else if (prod.category === "necklaces")
            targetCats = ["rings", "bracelets", "sets"];
          else targetCats = ["accessories", "sets"];

          let related: Product[] = [];
          snapshot.forEach((d) => {
            const p = d.data() as Product;
            if (p.id !== prod.id && targetCats.includes(p.category || "")) {
              const initRel = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
              if (initRel && (p.image?.includes("/assets/") || !p.image || p.image?.includes('regenerated_'))) {
                p.image = initRel.image;
              }
              related.push(p);
            }
          });

          if (related.length < 3) {
            // Fallback if not enough matching items: get other categories or random
            snapshot.forEach((d) => {
              const p = d.data() as Product;
              if (p.id !== prod.id && !related.find((r) => r.id === p.id)) {
                const initRel = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
                if (initRel && (p.image?.includes("/assets/") || !p.image || p.image?.includes('regenerated_'))) {
                  p.image = initRel.image;
                }
                related.push(p);
              }
            });
          }

          const shuffled = related.sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 3));
        } else {
          console.error("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-500">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display text-2xl font-bold mb-4">
          Product Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-neutral-900 underline underline-offset-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (product && customValue.trim()) {
      const fullCustomization = `${customValue} | Color: ${selectedColor} | Chain: ${selectedChainSize}`;
      addToCart(product, fullCustomization, quantity);
      setCustomValue("");
      setQuantity(1);
      setSelectedColor("Gold");
      setSelectedChainSize("18 Inches - Standard Chain");
    }
  };

  const handleBuyNow = () => {
    if (product && customValue.trim()) {
      const fullCustomization = `${customValue} | Color: ${selectedColor} | Chain: ${selectedChainSize}`;
      addToCart(product, fullCustomization, quantity);
      navigate("/checkout");
    }
  };

  const today = new Date();
  const formatDt = (d: Date) => d.toLocaleDateString("en-US", { day: 'numeric', month: 'short' }).toUpperCase();
  const formatRange = (d1: Date, d2: Date) => {
    if (d1.getMonth() === d2.getMonth()) {
       return `${formatDt(d1)}-${d2.getDate()}`;
    }
    return `${formatDt(d1)} - ${formatDt(d2)}`;
  };
  
  const todayStr = formatDt(today);
  const readyStart = new Date(today); readyStart.setDate(readyStart.getDate() + 2);
  const readyEnd = new Date(today); readyEnd.setDate(readyEnd.getDate() + 3);
  const readyStr = formatRange(readyStart, readyEnd);
  
  const delivStart = new Date(today); delivStart.setDate(delivStart.getDate() + 7);
  const delivEnd = new Date(today); delivEnd.setDate(delivEnd.getDate() + 8);
  const delivStr = formatRange(delivStart, delivEnd);

  return (
    <div className="pt-0 pb-12 md:py-12 bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-0 md:px-10 lg:px-10">
        <div className="hidden md:flex justify-end items-center mb-8 px-4 md:px-0">
          {isAdmin && (
            <button
              onClick={openEditor}
              className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 transition-colors border border-neutral-300"
            >
              <Edit3 size={16} /> Edit Product & Pictures
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="md:hidden px-4 mb-4 flex justify-end">
            <button
              onClick={openEditor}
              className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 transition-colors border border-neutral-300 mt-2"
            >
              <Edit3 size={16} /> Edit
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-0 md:gap-[72px]">
          {/* Left Column */}
          <div className="contents md:flex md:w-1/2 md:flex-col md:gap-4">
            <div className="order-2 md:order-none w-full flex flex-col gap-4 mb-6 md:mb-0">
              
              {/* Desktop Main Image */}
              <div className="hidden md:block overflow-hidden bg-neutral-100 aspect-square border border-neutral-200 cursor-zoom-in">
                <img
                  src={selectedImage}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = `https://a.storyblok.com/f/191576/1200x800/215e59568f/round_fallback.webp`;
                  }}
                />
              </div>

              {/* Mobile Swipeable Gallery */}
              <div className="md:hidden relative w-full aspect-square bg-neutral-100 border border-neutral-200 overflow-hidden">
                <div 
                  className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={(e) => {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const width = e.currentTarget.clientWidth;
                    const index = Math.round(scrollLeft / width);
                    if (galleryImages[index]) {
                      setSelectedImage(galleryImages[index]);
                    }
                  }}
                >
                  {galleryImages.slice(0, 3).map((img, idx) => (
                    <div key={`mobile-img-${idx}`} className="w-full h-full flex-shrink-0 snap-center relative">
                      <img
                        loading="lazy"
                        src={img}
                        alt={`${product.name} ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://a.storyblok.com/f/191576/1200x800/215e59568f/round_fallback.webp`;
                        }}
                      />
                    </div>
                  ))}
                </div>
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                  {galleryImages.slice(0, 3).map((img, idx) => (
                    <div 
                      key={`dot-${idx}`} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        selectedImage === img || (idx === 0 && !galleryImages.slice(0, 3).includes(selectedImage))
                          ? 'bg-neutral-900 scale-125' 
                          : 'bg-white/80 border border-neutral-300'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="hidden md:grid grid-cols-3 gap-2 sm:gap-4 mt-2">
                  {galleryImages.slice(0, 3).map((img, idx) => (
                    <button
                      key={`desktop-thumb-${idx}`}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square border bg-neutral-50 overflow-hidden transition-all duration-200 ${
                        selectedImage === img 
                          ? "border-neutral-900 border-2 shadow-sm scale-[1.02]" 
                          : "border-neutral-200 hover:border-neutral-400 hover:shadow-sm"
                      }`}
                    >
                      <img
                        loading="lazy"
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://a.storyblok.com/f/191576/1200x800/215e59568f/round_fallback.webp`;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {product.salePrice < product.originalPrice && (
                <div className="mt-2 mb-8 inline-block bg-[#E63946] text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider w-max">
                  Sale: Save{" "}
                  {Math.round(
                    (1 - product.salePrice / product.originalPrice) * 100,
                  )}
                  %
                </div>
              )}
            </div>


          </div>

          {/* Right Column */}
          <div className="contents md:flex md:w-1/2 md:flex-col">
            {/* Order Tracking Timeline */}
            <div className="order-1 md:order-none w-full px-4 md:px-0 mt-2 md:mt-0 mb-6 flex items-center justify-between text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">✓</div>
                <span>Ordered ({todayStr})</span>
              </div>
              <div className="h-px bg-neutral-300 flex-1 mx-2 mt-[-16px]"></div>
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-neutral-300 flex items-center justify-center mb-1"></div>
                <span>Ready ({readyStr})</span>
              </div>
              <div className="h-px bg-neutral-300 flex-1 mx-2 mt-[-16px]"></div>
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-neutral-300 flex items-center justify-center mb-1"></div>
                <span>Delivered ({delivStr})</span>
              </div>
            </div>

            <div className="order-3 md:order-none w-full px-4 md:px-0 mb-0">
              <h1 className="font-display text-neutral-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 400, letterSpacing: "0.5px", marginBottom: "20px" }}>
                {product.name}
              </h1>
  
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <span className="font-sans" style={{ fontSize: "18px", fontWeight: 500, color: "#222222", letterSpacing: "0.5px" }}>
                  Rs. {product.salePrice.toLocaleString()}.00 PKR
                </span>
                {product.originalPrice > product.salePrice && (
                  <span className="text-neutral-400 line-through font-sans" style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "0.5px" }}>
                    Rs. {product.originalPrice.toLocaleString()}.00 PKR
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500 mb-0">Shipping calculated at checkout</p>
            </div>

            <div className="order-4 md:order-none w-full px-4 md:px-0 space-y-4 mt-[28px]">
              {/* Dropdowns */}
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2 uppercase tracking-wide">Color</label>
                  <select 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full border-2 border-neutral-300 px-4 py-3 text-base focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-white"
                  >
                    <option value="Gold Colour">Gold Colour</option>
                    <option value="Silver Colour">Silver Colour</option>
                  </select>
                </div>
                { (product.category?.toLowerCase().includes('locket') || product.category?.toLowerCase().includes('necklace') || product.name?.toLowerCase().includes('locket') || product.name?.toLowerCase().includes('necklace')) && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2 uppercase tracking-wide">Chain Size</label>
                    <select 
                      value={selectedChainSize}
                      onChange={(e) => setSelectedChainSize(e.target.value)}
                      className="w-full border-2 border-neutral-300 px-4 py-3 text-base focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-white"
                    >
                      <option value="16 Inches">16 Inches</option>
                      <option value="18 Inches - Standard">18 Inches - Standard</option>
                      <option value="20 Inches">20 Inches</option>
                      <option value="22 Inches">22 Inches</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor={`custom-${product.id}`}
                  className="block text-sm font-medium text-neutral-900 mb-2 uppercase tracking-wide flex justify-between"
                >
                  <span>{product.customFieldLabel || "ENTER CUSTOM TEXT"}</span>
                  <span className="text-red-500">*Required</span>
                </label>
                <input
                  id={`custom-${product.id}`}
                  required
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="e.g. N & S | 22.07.2017 EST."
                  className="w-full border-2 border-neutral-300 px-4 py-3 text-base focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
                />
                <p className="text-xs text-neutral-500 mt-2">Max 12 characters per piece. We'll engrave exactly as you type.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-end gap-4 pt-[28px]">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2 uppercase tracking-wide">
                    Quantity
                  </label>
                  <div className="flex items-center border border-neutral-300 rounded-none w-28">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="flex-1 text-center font-medium text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-3 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 w-full">
                  <button
                    onClick={handleAdd}
                    disabled={!customValue.trim()}
                    className="w-full bg-[#111] hover:bg-black text-white hover:text-[#D4AF37] border border-[#111] hover:border-[#D4AF37] py-[14px] px-4 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:-translate-y-0.5 text-[16px] font-medium uppercase rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{ letterSpacing: "1.5px" }}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!customValue.trim()}
                    className="w-full bg-[#111] hover:bg-black text-white hover:text-[#D4AF37] border border-[#111] hover:border-[#D4AF37] py-[14px] px-4 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:-translate-y-0.5 text-[16px] font-medium uppercase rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    style={{ letterSpacing: "1.5px" }}
                  >
                    Buy it Now
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Product Description (Hidden on Desktop) */}
            <div className="order-5 md:hidden w-full px-4 mt-10 pt-8 border-t border-neutral-200">
              <h2 className="text-center font-bold text-neutral-900 tracking-widest uppercase mb-6 text-sm">✨ PRODUCT DESCRIPTION ✨</h2>
              <div className="text-neutral-700 text-sm space-y-4 px-2">
                <p className="leading-relaxed mb-6 text-center">{product.description}</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="text-neutral-400 mt-0.5">✦</span>
                    <span className="leading-relaxed"><strong>Customizable Design:</strong> Add any name to make it truly yours and special.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-neutral-400 mt-0.5">✦</span>
                    <span className="leading-relaxed"><strong>Premium Quality:</strong> Made with strong Stainless Steel with Gold Plating. Tarnish-free and long lasting.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-neutral-400 mt-0.5">✦</span>
                    <span className="leading-relaxed"><strong>Perfect Gift:</strong> The best gift for birthdays, anniversaries, and special moments.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-neutral-400 mt-0.5">✦</span>
                    <span className="leading-relaxed"><strong>Elegant Style:</strong> Looks beautiful with both casual and formal outfits.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-neutral-400 mt-0.5">✦</span>
                    <span className="leading-relaxed"><strong>Water Resistant:</strong> Safe to wear daily. Does not fade or turn black.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="order-6 md:order-none w-full px-4 md:px-0 mt-6 mb-0">
              <div className="bg-neutral-50 border border-neutral-200 p-4 flex flex-row items-center justify-between text-sm text-neutral-700 divide-x divide-neutral-300">
                <div className="flex items-start gap-3 w-1/2 pr-4">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="font-bold text-neutral-900 leading-tight mb-1">Make & Deliver</p>
                    <p className="text-xs">5 to 7 working days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 w-1/2 pl-4">
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="font-bold text-neutral-900 leading-tight mb-1">Payment</p>
                    <p className="text-xs">Rs. 200 Advance, rest COD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Product Description (Full Width, Hidden on Mobile) */}
        <div className="hidden md:block w-full mt-4">
          <h2 className="text-center font-bold text-neutral-900 tracking-widest uppercase mb-8 text-base">✨ PRODUCT DESCRIPTION ✨</h2>
          <div className="text-neutral-700 text-[18px] leading-[1.6] space-y-4 max-w-4xl mx-auto px-4">
            <p className="mb-8 text-center">{product.description}</p>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <span className="text-neutral-400 mt-0.5 text-xl">✦</span>
                <span><strong>Customizable Design:</strong> Add any name to make it truly yours and special.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-neutral-400 mt-0.5 text-xl">✦</span>
                <span><strong>Premium Quality:</strong> Made with strong Stainless Steel with Gold Plating. Tarnish-free and long lasting.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-neutral-400 mt-0.5 text-xl">✦</span>
                <span><strong>Perfect Gift:</strong> The best gift for birthdays, anniversaries, and special moments.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-neutral-400 mt-0.5 text-xl">✦</span>
                <span><strong>Elegant Style:</strong> Looks beautiful with both casual and formal outfits.</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-neutral-400 mt-0.5 text-xl">✦</span>
                <span><strong>Water Resistant:</strong> Safe to wear daily. Does not fade or turn black.</span>
              </li>
            </ul>
          </div>
        </div>

            {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-neutral-100">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-10 text-center">
              Perfect Match For You
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
              {relatedProducts.map((p) => (
                <div key={p.id} className="group relative block bg-white">
                  <Link
                    to={`/product/${p.id}`}
                    className="block"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    <div className="relative aspect-square overflow-hidden bg-neutral-100 mb-4 border border-neutral-200">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.src = `https://a.storyblok.com/f/191576/1200x800/215e59568f/round_fallback.webp`;
                        }}
                      />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-neutral-900 group-hover:underline line-clamp-1 mb-1">
                      {p.name}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <p className="text-neutral-900 font-bold">
                        Rs. {p.salePrice}
                      </p>
                      {p.originalPrice > p.salePrice && (
                        <p className="text-neutral-400 line-through text-sm">
                          Rs. {p.originalPrice}
                        </p>
                      )}
                    </div>
                  </Link>
                  {isAdmin && (
                    <Link to="/category/all" className="absolute top-2 right-2 bg-white/90 p-1.5 hover:bg-white text-neutral-700 shadow-sm transition-colors border border-neutral-200 z-10" title="Go to Shop to edit">
                        <Edit3 size={14} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Editor Modal for Product Details and Pictures */}
      <AnimatePresence>
        {isEditorOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] z-10"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
                <h2 className="font-display font-bold text-xl text-neutral-900">Edit Product Details & Pictures</h2>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveChanges} className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Product Name</label>
                    <input
                      required
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Original Price (Rs.)</label>
                    <input
                      required
                      type="number"
                      value={editOriginalPrice}
                      onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Sale Price (Rs.)</label>
                    <input
                      required
                      type="number"
                      value={editSalePrice}
                      onChange={(e) => setEditSalePrice(Number(e.target.value))}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-800"
                    />
                  </div>

                  {/* Main Cover Image Uploader */}
                  <div className="sm:col-span-2 border-t border-neutral-100 pt-6">
                    <h3 className="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wide">1. Main Cover Image</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-24 h-24 border border-neutral-200 bg-neutral-50 overflow-hidden shrink-0">
                        <img src={editImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="relative border border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition-colors py-3 px-4 flex items-center justify-center gap-2 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <UploadCloud size={18} className="text-neutral-500" />
                          <span className="text-xs font-semibold text-neutral-700">Upload New Cover Photo</span>
                        </div>
                        {isUploading && <p className="text-xs text-blue-600 mt-1">Processing image...</p>}
                        <p className="text-[10px] text-neutral-400 mt-1">Accepts JPEG, PNG, WebP up to 2MB (resized to 800x800 webp)</p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails Manager */}
                  <div className="sm:col-span-2 border-t border-neutral-100 pt-6">
                    <h3 className="text-sm font-bold text-neutral-900 mb-1 uppercase tracking-wide">2. Thumbnail Images</h3>
                    <p className="text-xs text-neutral-500 mb-3">Upload two thumbnail images displayed below the product.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Thumbnail 1 */}
                      <div className="flex-1 flex flex-col gap-3 border border-neutral-200 p-4 bg-neutral-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-neutral-900 uppercase">Thumbnail 1</span>
                          {editThumbnail1 && (
                            <button
                              type="button"
                              onClick={() => setEditThumbnail1("")}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="aspect-square bg-white border border-neutral-200 flex items-center justify-center overflow-hidden">
                          {editThumbnail1 ? (
                            <img src={editThumbnail1} alt="Thumbnail 1" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-neutral-400">Default fallback</span>
                          )}
                        </div>
                        <div className="relative border border-dashed border-neutral-300 hover:bg-neutral-100 transition-colors py-2 flex justify-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleThumbnailUpload(e, 1)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                            <UploadCloud size={14} /> {isThumb1Uploading ? "Uploading..." : "Upload Thumbnail 1"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Thumbnail 2 */}
                      <div className="flex-1 flex flex-col gap-3 border border-neutral-200 p-4 bg-neutral-50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-neutral-900 uppercase">Thumbnail 2</span>
                          {editThumbnail2 && (
                            <button
                              type="button"
                              onClick={() => setEditThumbnail2("")}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="aspect-square bg-white border border-neutral-200 flex items-center justify-center overflow-hidden">
                          {editThumbnail2 ? (
                            <img src={editThumbnail2} alt="Thumbnail 2" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-neutral-400">Default fallback</span>
                          )}
                        </div>
                        <div className="relative border border-dashed border-neutral-300 hover:bg-neutral-100 transition-colors py-2 flex justify-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleThumbnailUpload(e, 2)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                            <UploadCloud size={14} /> {isThumb2Uploading ? "Uploading..." : "Upload Thumbnail 2"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Manager */}
                  <div className="sm:col-span-2 border-t border-neutral-100 pt-6">
                    <h3 className="text-sm font-bold text-neutral-900 mb-1 uppercase tracking-wide">3. Manage Product Gallery</h3>
                    <p className="text-xs text-neutral-500 mb-3">Upload up to 4 images for the "SEE IT IN REAL LIFE" section.</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {editGallery.map((img, idx) => (
                        <div key={idx} className="relative aspect-square border border-neutral-200 bg-neutral-50 overflow-hidden group">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImg(idx)}
                            className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      
                      <div className="relative aspect-square border-2 border-dashed border-neutral-300 hover:bg-neutral-100 transition-colors flex flex-col items-center justify-center cursor-pointer p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGalleryUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud size={24} className="text-neutral-400 mb-2" />
                        <span className="text-xs font-semibold text-neutral-700 text-center">
                          {isGalleryUploading ? "Uploading..." : "Upload New Image"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 border-t border-neutral-100 pt-6">
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white transition-all text-neutral-600"
                    >
                      <option value="necklaces">Necklaces</option>
                      <option value="rings">Rings</option>
                      <option value="bracelets">Bracelets</option>
                      <option value="sets">Sets</option>
                      <option value="accessories">Cufflinks & Keychains</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Custom Field Label</label>
                    <input
                      required
                      type="text"
                      value={editCustomFieldLabel}
                      onChange={(e) => setEditCustomFieldLabel(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Custom Field Placeholder</label>
                    <input
                      required
                      type="text"
                      value={editCustomFieldPlaceholder}
                      onChange={(e) => setEditCustomFieldPlaceholder(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-800"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100 flex gap-3 shrink-0">
                  <button
                    type="submit"
                    disabled={isUploading || isGalleryUploading}
                    className="flex-1 bg-neutral-900 hover:bg-black text-white py-3 rounded-none font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Check size={18} /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 py-3 rounded-none font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
