import React, { useState, useEffect } from 'react';
import { ShoppingCart, Edit3, Trash2, X, Plus, Check, LogIn, LogOut, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { INITIAL_PRODUCTS } from '../data/products';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function ProductSection({ onAddToCart, filterCategory = "all" }: { onAddToCart: (product: Product, custom: string, qty?: number) => void, filterCategory?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch from Firestore
  useEffect(() => {
    const productsRef = collection(db, 'products');
    
    // Check and seed INITIAL_PRODUCTS if empty (run once)
    const seedInitialData = async () => {
      if (user?.email !== 'kiranabdullah70@gmail.com') return;
      try {
        await deleteDoc(doc(db, 'products', 'necklace-1'));
        const snapshot = await getDocs(productsRef);
        // Force update our images if they do not match INITIAL_PRODUCTS
        if (!snapshot.empty) {
           for (const docSnap of snapshot.docs) {
              const data = docSnap.data() as Product;
              if (data.id === 'necklace-1') continue;
              // Check if it's one of the seeded products
              const init = INITIAL_PRODUCTS.find(i => i.id === data.id);
              if (init && init.image !== data.image && (data.image?.includes('/assets/') || !data.image || data.image?.includes('regenerated_'))) {
                  // Admin hasn't overridden it with external link, so safe to sync our new generated image import hash
                  await setDoc(doc(productsRef, data.id), { ...data, image: init.image }, { merge: true });
              }
           }
        }

        if (snapshot.empty) {
          // Fallback to localStorage just in case it had old custom items
          const savedStr = localStorage.getItem('ak_jewellers_products');
          let savedProducts = INITIAL_PRODUCTS;
          if (savedStr) {
              try {
                  const parsed = JSON.parse(savedStr);
                  if (parsed.length > 0) savedProducts = parsed.filter((p: any) => p.id !== 'necklace-1');
              } catch(e){}
          }
          
          for (const prod of savedProducts) {
             if (prod.id === 'necklace-1') continue;
             await setDoc(doc(productsRef, prod.id), prod);
          }
        }
      } catch (e) {
        console.error("Error seeding initial data", e);
      }
    };
    
    let unsubscribe: () => void = () => {};
    seedInitialData().then(() => {
        // Now listen to realtime updates
        unsubscribe = onSnapshot(productsRef, (snapshot) => {
          const fetchProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            const p = docSnap.data() as Product;
            if (p.id === 'necklace-1') return;
            const initial = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
            if (initial && (p.image?.includes('/assets/') || !p.image || p.image?.includes('regenerated_'))) {
               p.image = initial.image;
            }
            fetchProducts.push(p);
          });
          if (fetchProducts.length === 0) {
            setProducts(INITIAL_PRODUCTS);
          } else {
            setProducts(fetchProducts);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching products: ", error);
            setProducts(INITIAL_PRODUCTS);
            setLoading(false);
        });
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        setImagePreview(dataUrl);
        setIsUploading(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        alert("Please login to save products.");
        return;
    }

    const formData = new FormData(e.currentTarget);
    const galleryRaw = formData.get('gallery') as string;
    const galleryItems = galleryRaw ? galleryRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const finalImage = imagePreview || formData.get('image') as string || 'https://images.unsplash.com/photo-1599643478514-4a4e06d538e1?auto=format&fit=crop&q=80&w=1000';

    const newProduct: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: formData.get('name') as string,
      originalPrice: Number(formData.get('originalPrice')),
      salePrice: Number(formData.get('salePrice')),
      description: formData.get('description') as string,
      customFieldLabel: formData.get('customFieldLabel') as string,
      customFieldPlaceholder: formData.get('customFieldPlaceholder') as string,
      image: finalImage,
      category: formData.get('category') as string || 'other',
      gallery: galleryItems.length > 0 ? galleryItems : undefined
    };

    try {
        await setDoc(doc(db, 'products', newProduct.id), newProduct);
        setEditingProduct(null);
        setIsEditorOpen(false);
        setImagePreview('');
    } catch (error: any) {
        console.error("Error saving product", error);
        alert("Failed to save product. Check image size. " + error.message);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteDoc(doc(db, 'products', id));
        } catch (error: any) {
            console.error("Error deleting product", error);
            alert("Failed to delete product. " + error.message);
        }
    }
  };

  const isAdmin = user?.email === 'kiranabdullah70@gmail.com';

  const openEditor = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setImagePreview(prod.image);
    } else {
      setEditingProduct(null);
      setImagePreview('');
    }
    setIsEditorOpen(true);
  };

  return (
    <section id="shop" className="pt-8 pb-20 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-4 sm:px-0">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 tracking-wide">Featured Collection</h2>
          <p className="text-neutral-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Every piece is crafted meticulously upon confirmation. <span className="whitespace-nowrap">Making and delivery takes 5 to 7 working days.</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4">
            {isAdmin && (
                <button 
                onClick={() => openEditor()}
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
                >
                <Plus size={16} /> Add Product
                </button>
            )}
            
            {isAdmin && (
                <div className="flex items-center gap-4">
                  <Link to="/admin" className="text-sm font-semibold text-neutral-900 bg-neutral-100 px-3 py-1.5 hover:bg-neutral-200 transition-colors border border-neutral-300">
                    Admin Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-semibold text-neutral-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
                      <LogOut size={16} /> Logout
                  </button>
                </div>
            )}
        </div>
      </div>

      {loading ? (
          <div className="py-20 text-center text-neutral-500">Loading products from database...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
            {products
              .filter(product => {
                let cat = product.category;
                if (!cat) {
                  const title = product.name.toLowerCase();
                  if (title.includes('ring')) cat = 'rings';
                  else if (title.includes('bracelet') || title.includes('bangle')) cat = 'bracelets';
                  else if (title.includes('set')) cat = 'sets';
                  else if (title.includes('cufflink')) cat = 'accessories';
                  else cat = 'necklaces';
                }
                return filterCategory === 'all' || cat === filterCategory;
              })
              .map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                isAdmin={isAdmin}
                onAdd={onAddToCart} 
                onEdit={() => openEditor(product)}
                onDelete={(e) => { handleDelete(product.id, e); }}
            />
            ))}
            {products.filter(product => {
                let cat = product.category;
                if (!cat) {
                  const title = product.name.toLowerCase();
                  if (title.includes('ring')) cat = 'rings';
                  else if (title.includes('bracelet') || title.includes('bangle')) cat = 'bracelets';
                  else if (title.includes('set')) cat = 'sets';
                  else if (title.includes('cufflink')) cat = 'accessories';
                  else cat = 'necklaces';
                }
                return filterCategory === 'all' || cat === filterCategory;
              }).length === 0 && (
            <div className="col-span-full text-center py-12 text-neutral-500 bg-white border border-neutral-200 border-dashed">
                <p>No products available in this category.</p>
            </div>
            )}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
             <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
             >
               <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
                 <h2 className="font-display font-bold text-xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                 <button onClick={() => setIsEditorOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full transition-colors"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Product Name</label>
                      <input required name="name" defaultValue={editingProduct?.name} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium placeholder:font-normal" placeholder="e.g. Custom Name Necklace" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Original Price (Rs.)</label>
                      <input required type="number" name="originalPrice" defaultValue={editingProduct?.originalPrice} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="1199" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Sale Price (Rs.)</label>
                      <input required type="number" name="salePrice" defaultValue={editingProduct?.salePrice} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="899" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Upload New Image</label>
                      <div className="flex items-center gap-4 border-2 border-dashed border-neutral-300 p-4 relative bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center gap-3">
                          <UploadCloud size={24} className="text-neutral-500" />
                          <div className="text-sm">
                            <span className="font-semibold text-neutral-900">Click to upload</span> or drag and drop
                            <p className="text-neutral-500 text-xs mt-1">JPEG, PNG, WebP up to 2MB</p>
                          </div>
                        </div>
                      </div>
                      {isUploading && <p className="text-xs text-blue-600 mt-2">Processing image...</p>}
                      {imagePreview && (
                        <div className="mt-4 relative w-32 h-32 border border-neutral-200">
                           <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Image URL (Fallback if not uploaded)</label>
                      <input name="image" defaultValue={editingProduct?.image} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="https://..." />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Gallery Images (Comma-separated URLs)</label>
                      <input name="gallery" defaultValue={editingProduct?.gallery?.join(', ')} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="https://img1.jpg, https://img2.jpg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Description</label>
                      <textarea required name="description" defaultValue={editingProduct?.description} rows={3} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none" placeholder="Product details..."></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Category</label>
                      <select name="category" defaultValue={editingProduct?.category || 'necklaces'} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white transition-all text-neutral-600">
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
                      <input required name="customFieldLabel" defaultValue={editingProduct?.customFieldLabel} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="e.g. Enter Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Custom Field Placeholder</label>
                      <input required name="customFieldPlaceholder" defaultValue={editingProduct?.customFieldPlaceholder} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="e.g. Sarah" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button type="submit" className="flex-1 bg-neutral-900 hover:bg-black text-white py-3 rounded-none font-medium flex items-center justify-center gap-2 transition-colors">
                      <Check size={18} /> Save Product
                    </button>
                    <button type="button" onClick={() => setIsEditorOpen(false)} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 py-3 rounded-none font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProductCard({ product, isAdmin, onAdd, onEdit, onDelete }: { key?: any, product: Product, isAdmin: boolean, onAdd: (product: Product, custom: string, qty?: number) => void, onEdit: () => void, onDelete: (e: React.MouseEvent) => any }) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group flex flex-col bg-white overflow-hidden cursor-pointer pb-6"
    >
      <div className="relative aspect-square overflow-hidden bg-[#FAFAFA] mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 absolute inset-0 z-10"
          onError={(e) => { e.currentTarget.src = `https://a.storyblok.com/f/191576/1200x800/215e59568f/round_fallback.webp`; }} // fallback if generation fails
        />
        {product.salePrice < product.originalPrice && (
            <div className="absolute top-3 left-3 bg-[#E63946] text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest z-20">
            Save {Math.round((1 - product.salePrice / product.originalPrice) * 100)}%
            </div>
        )}
        
        {isAdmin && (
            <div className="absolute top-3 right-3 flex gap-2 z-30 opacity-100 transition-opacity">
                <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="bg-white/95 p-2 rounded-full text-neutral-600 hover:text-neutral-900 transition-colors shadow-sm"
                title="Edit product"
                >
                <Edit3 size={14} />
                </button>
                <button 
                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                className="bg-white/95 p-2 rounded-full text-neutral-600 hover:text-red-500 transition-colors shadow-sm"
                title="Delete product"
                >
                <Trash2 size={14} />
                </button>
            </div>
        )}
      </div>
      
      <div className="px-1 flex-1 flex flex-col items-center text-center">
        <h3 className="font-display font-medium text-sm sm:text-base text-neutral-900 leading-tight mb-2 tracking-wide line-clamp-1">{product.name}</h3>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <span className="text-[#D4AF37] font-medium text-sm sm:text-base">Rs. {product.salePrice.toLocaleString()}.00</span>
          {product.originalPrice > product.salePrice && (
              <span className="text-neutral-400 line-through text-xs">Rs. {product.originalPrice.toLocaleString()}.00</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
