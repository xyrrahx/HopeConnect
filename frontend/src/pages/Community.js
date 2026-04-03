import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Group as Users, Plus, Filter, Heart } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Community() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [user, setUser] = useState(null);

  const categories = ['all', 'General', 'Success Stories', 'Questions', 'Resources'];

  useEffect(() => {
    fetchPosts();
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => {});
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/community`);
      setPosts(response.data);
      setFilteredPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = posts;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setFilteredPosts(filtered);
  }, [selectedCategory, posts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to post');
      return;
    }

    try {
      await axios.post(`${API}/community`, newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPost({ title: '', content: '', category: 'General' });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Community Board
              </h1>
              <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                Share experiences and connect with others
              </p>
            </div>
            <button
              onClick={() => user ? setShowCreatePost(!showCreatePost) : alert('Please sign in to post')}
              data-testid="create-post-button"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 border-slate-900 bg-[#BFDBFE] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              <span>New Post</span>
            </button>
          </div>

          {showCreatePost && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreatePost}
              data-testid="create-post-form"
              className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-brutal-lg mb-8"
            >
              <input
                type="text"
                placeholder="Post title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                data-testid="post-title-input"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#BFDBFE]/30 outline-none text-slate-900 font-bold mb-3"
                required
              />
              <textarea
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                data-testid="post-content-input"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#BFDBFE]/30 outline-none text-slate-900 font-medium mb-3 min-h-[120px]"
                required
              />
              <div className="flex items-center justify-between">
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  data-testid="post-category-select"
                  className="px-4 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-sm"
                >
                  {categories.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    data-testid="cancel-post-button"
                    className="px-6 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="submit-post-button"
                    className="px-6 py-2 rounded-full border-2 border-slate-900 bg-[#BFDBFE] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-2 items-center mb-6">
          <Filter className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`filter-${cat.toLowerCase().replace(' ', '-')}`}
              className={`px-4 py-2 rounded-full border-2 border-slate-900 font-bold text-sm uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-[#BFDBFE] text-slate-900 shadow-[2px_2px_0px_#0F172A]'
                  : 'bg-white text-slate-700 hover:bg-[#A7E6D7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#BFDBFE] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`post-card-${post.id}`}
                className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#A7E6D7] rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>{post.user_name}</p>
                      <p className="text-xs text-slate-600 font-medium">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full border-2 border-slate-900 bg-[#FDE68A] text-xs font-bold uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {post.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-700 font-medium mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                  {post.content}
                </p>

                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-slate-900 bg-white hover:bg-[#FF9D8A] transition-all">
                    <Heart className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-bold">{post.likes || 0}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600 font-medium">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;