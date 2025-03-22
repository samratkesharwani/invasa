import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogService } from '../../utils/blogService';
import toast from 'react-hot-toast';

const BlogEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    categories: [],
    tags: [],
    status: 'draft',
    published_at: null
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const data = await blogService.getBlogPost(slug);
      setPost(data);
    } catch (error) {
      toast.error('Failed to fetch post');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await blogService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const data = await blogService.getTags();
      setTags(data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (slug) {
        await blogService.updateBlogPost(slug, post);
      } else {
        await blogService.createBlogPost(post);
      }
      toast.success(`Post ${slug ? 'updated' : 'created'} successfully`);
      navigate('/admin/blog');
    } catch (error) {
      toast.error(`Failed to ${slug ? 'update' : 'create'} post`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const category = await blogService.createCategory(newCategory);
      setCategories([...categories, category]);
      setPost({
        ...post,
        categories: [...post.categories, { category }]
      });
      setNewCategory('');
      toast.success('Category added');
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const tag = await blogService.createTag(newTag);
      setTags([...tags, tag]);
      setPost({
        ...post,
        tags: [...post.tags, tag]
      });
      setNewTag('');
      toast.success('Tag added');
    } catch (error) {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveCategory = (categoryId) => {
    setPost({
      ...post,
      categories: post.categories.filter(cat => cat.category.id !== categoryId)
    });
  };

  const handleRemoveTag = (tagId) => {
    setPost({
      ...post,
      tags: post.tags.filter(tag => tag.id !== tagId)
    });
  };

  return (
    <>
      <Helmet>
        <title>{slug ? 'Edit Post' : 'New Post'} - Admin Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-black">
              {slug ? 'Edit Post' : 'New Post'}
            </h1>
            <button
              onClick={() => navigate('/admin/blog')}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-black transition-colors"
            >
              Back to Posts
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <div className="bg-gray-800 rounded-lg">
                <ReactQuill
                  value={post.content}
                  onChange={(content) => setPost({ ...post, content })}
                  className="text-black"
                  theme="snow"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={post.excerpt}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label htmlFor="featured_image" className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                id="featured_image"
                value={post.featured_image}
                onChange={(e) => setPost({ ...post, featured_image: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((cat) => (
                  <span
                    key={cat.category.id}
                    className="px-3 py-1 bg-indigo-900/50 text-indigo-400 rounded-full text-sm flex items-center"
                  >
                    {cat.category.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.category.id)}
                      className="ml-2 text-indigo-400 hover:text-indigo-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-2 text-gray-400 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                value={post.status}
                onChange={(e) => setPost({ ...post, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default BlogEditor; 