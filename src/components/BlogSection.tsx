import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, X, Plus, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlogPost } from '../types';
import { INITIAL_BLOGS } from '../data/blogs';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const isAdmin = user?.email === 'kiranabdullah70@gmail.com';

  useEffect(() => {
    const saved = localStorage.getItem('ak_jewellers_blogs');
    if (saved) {
      try {
        setBlogs(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveBlogs = (updatedBlogs: BlogPost[]) => {
    setBlogs(updatedBlogs);
    localStorage.setItem('ak_jewellers_blogs', JSON.stringify(updatedBlogs));
  };

  const handleSavePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPost: BlogPost = {
      id: editingPost?.id || Date.now().toString(),
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      date: editingPost?.date || new Date().toISOString().split('T')[0],
      imageUrl: formData.get('imageUrl') as string || 'https://images.unsplash.com/photo-1599643478514-4a4e06d538e1?auto=format&fit=crop&q=80&w=1000'
    };

    if (editingPost) {
      saveBlogs(blogs.map(b => b.id === editingPost.id ? newPost : b));
    } else {
      saveBlogs([newPost, ...blogs]);
    }
    setEditingPost(null);
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this post?')) {
      saveBlogs(blogs.filter(b => b.id !== id));
    }
  };

  return (
    <section id="blog" className="py-20 bg-neutral-50 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-2">Our Journal</h2>
            <p className="text-neutral-600 max-w-2xl">Discover tips, stories, and inspiration behind our jewelry craft.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => { setEditingPost(null); setIsEditorOpen(true); }}
              className="hidden sm:flex text-sm font-semibold text-neutral-500 hover:text-neutral-900 items-center gap-1.5 transition-colors"
            >
              <Edit3 size={16} /> Manage Blogs
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div 
              key={blog.id} 
              onClick={() => setViewingPost(blog)}
              className="bg-white border border-neutral-200 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                {isAdmin && (
                  <>
                    <button 
                      onClick={(e) => handleDelete(blog.id, e)}
                      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingPost(blog); setIsEditorOpen(true); }}
                      className="absolute top-2 right-10 bg-white/90 p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit post"
                    >
                      <Edit3 size={16} />
                    </button>
                  </>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-xs font-semibold text-neutral-400 mb-2">{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <h3 className="font-display font-bold text-xl text-neutral-900 mb-3">{blog.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{blog.excerpt}</p>
                <span className="text-sm font-medium text-neutral-900 group-hover:underline mt-auto">Read article &rarr;</span>
              </div>
            </div>
          ))}
          {blogs.length === 0 && (
             <div className="col-span-full text-center py-12 text-neutral-500 bg-white border border-neutral-200 border-dashed">
                <p>No blog posts yet. Add one to get started!</p>
             </div>
          )}
        </div>
        
        {isAdmin && (
          <div className="mt-8 flex justify-center sm:hidden">
              <button 
                  onClick={() => { setEditingPost(null); setIsEditorOpen(true); }}
                  className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors font-semibold"
              >
                  <Edit3 size={16} /> Manage Blogs
              </button>
          </div>
        )}
      </div>

      {/* View Post Modal */}
      <AnimatePresence>
        {viewingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingPost(null)} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button onClick={() => setViewingPost(null)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                <X size={20} />
              </button>
              <div className="relative h-64 sm:h-80 shrink-0">
                <img src={viewingPost.imageUrl} alt={viewingPost.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
                  <p className="text-sm text-white/80 font-medium mb-2">{new Date(viewingPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">{viewingPost.title}</h2>
                </div>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto w-full prose prose-neutral max-w-none">
                {viewingPost.content.split('\n').map((line, i) => (
                  <p key={i} className="text-neutral-700 leading-relaxed min-h-[1.5rem]" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                 <h2 className="font-display font-bold text-xl">{editingPost ? 'Edit Blog Post' : 'Create New Post'}</h2>
                 <button onClick={() => setIsEditorOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full transition-colors"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-6 flex-1">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Post Title</label>
                    <input required name="title" defaultValue={editingPost?.title} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all font-medium placeholder:font-normal" placeholder="Enter a catchy title..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Short Excerpt</label>
                    <textarea required name="excerpt" defaultValue={editingPost?.excerpt} rows={2} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none" placeholder="A brief summary for the card..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Cover Image URL</label>
                    <input name="imageUrl" defaultValue={editingPost?.imageUrl} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all text-neutral-600" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5 flex justify-between">
                        <span>Full Content</span>
                        <span className="text-xs font-normal text-neutral-500">Use **text** for bold</span>
                    </label>
                    <textarea required name="content" defaultValue={editingPost?.content} rows={8} className="w-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none font-mono" placeholder="Write your post content here..."></textarea>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button type="submit" className="flex-1 bg-neutral-900 hover:bg-black text-white py-3 rounded-none font-medium flex items-center justify-center gap-2 transition-colors">
                      <Check size={18} /> Save Post
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
