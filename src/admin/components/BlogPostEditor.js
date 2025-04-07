import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService } from '../../utils/blogService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Import simplified hooks
import { useSimpleDebounce, useSimpleCache } from '../../utils/simpleFix';

// Helper to format date in a safe way
const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'Not published yet';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
      return 'Not published yet';
    }
    return date.toLocaleDateString();
  } catch (error) {
    return 'Not published yet';
  }
};

const BlogPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    category_ids: [],
    tag_ids: [],
    published_at: null, // Initialize as null
    created_at: new Date().toISOString(), // Default to now
    updated_at: new Date().toISOString()  // Default to now
  });

  // Create cached versions of our service calls for better performance
  const cachedGetCategories = useSimpleCache(blogService.getCategories);
  const cachedGetTags = useSimpleCache(blogService.getTags);
  const cachedGetBlogPost = useSimpleCache(blogService.getBlogPost);

  // Memoize fetch function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesData, tagsData] = await Promise.all([
        cachedGetCategories(),
        cachedGetTags()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);

      if (id) {
        const post = await cachedGetBlogPost(id);
        // Make sure we have valid dates
        const now = new Date().toISOString();
        setFormData({
          ...post,
          published_at: post.published_at || null,
          created_at: post.created_at || now,
          updated_at: post.updated_at || now,
          category_ids: post.categories?.map(c => c.category.id) || [],
          tag_ids: post.tags?.map(t => t.tag.id) || []
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [id, cachedGetCategories, cachedGetTags, cachedGetBlogPost]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submission directly instead of using the hook
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError(null);

    try {
      // Prepare data for submission with proper date handling
      const now = new Date().toISOString();
      const postData = {
        ...formData,
        meta_keywords: formData.meta_keywords.split(',').map(k => k.trim()),
        category_ids: formData.category_ids,
        tag_ids: formData.tag_ids,
        updated_at: now,
        // Set published_at if status is published and it's not already set
        published_at: formData.status === 'published' 
          ? (formData.published_at || now) 
          : null
      };

      if (id) {
        await blogService.updateBlogPost(id, postData);
      } else {
        // For new posts, always set created_at
        await blogService.createBlogPost({
          ...postData,
          created_at: now
        });
      }
      
      setLoading(false);
      navigate('/admin/blog');
    } catch (err) {
      console.error("Error saving blog post:", err);
      setError(err.message || "Failed to save blog post");
      setLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleQuillChange = useCallback((content) => {
    setFormData(prev => ({ ...prev, content }));
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  }, []);

  const handleTagChange = useCallback((tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  }, []);

  // Memoize the category and tag sections to prevent re-renders
  const categoriesSection = useMemo(() => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {categories.map(category => (
        <label key={category.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.category_ids.includes(category.id)}
            onChange={() => handleCategoryChange(category.id)}
            className="rounded bg-transparent"
          />
          <span>{category.name}</span>
        </label>
      ))}
    </div>
  ), [categories, formData.category_ids, handleCategoryChange]);

  const tagsSection = useMemo(() => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {tags.map(tag => (
        <label key={tag.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.tag_ids.includes(tag.id)}
            onChange={() => handleTagChange(tag.id)}
            className="rounded bg-transparent"
          />
          <span>{tag.name}</span>
        </label>
      ))}
    </div>
  ), [tags, formData.tag_ids, handleTagChange]);

  // Optimize Quill editor options
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  }), []);

  // Get published date display
  const publishedDateDisplay = useMemo(() => {
    return formData.published_at 
      ? formatDateForDisplay(formData.published_at)
      : 'Not published yet';
  }, [formData.published_at]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {id && (
        <div className="mb-4 p-3 bg-gray-100 rounded dark:bg-gray-800 text-sm">
          <p><span className="font-medium">Created:</span> {formatDateForDisplay(formData.created_at)}</p>
          <p><span className="font-medium">Last Updated:</span> {formatDateForDisplay(formData.updated_at)}</p>
          <p><span className="font-medium">Published:</span> {publishedDateDisplay}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <ReactQuill
            value={formData.content}
            onChange={handleQuillChange}
            modules={quillModules}
            className="h-64 mb-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image URL
          </label>
          <input
            type="url"
            name="featured_image"
            value={formData.featured_image}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {formData.status === 'published' && !formData.published_at && (
            <p className="text-sm text-blue-600 mt-1">
              This post will be published when you save.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          {categoriesSection}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          {tagsSection}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Title
          </label>
          <input
            type="text"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={handleChange}
            rows="2"
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Keywords (comma-separated)
          </label>
          <input
            type="text"
            name="meta_keywords"
            value={formData.meta_keywords}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/blog')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(BlogPostEditor); 