import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogService } from '../../utils/blogService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
    tag_ids: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          blogService.getCategories(),
          blogService.getTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);

        if (id) {
          const post = await blogService.getBlogPost(id);
          setFormData({
            ...post,
            category_ids: post.categories?.map(c => c.category.id) || [],
            tag_ids: post.tags?.map(t => t.tag.id) || []
          });
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const postData = {
        ...formData,
        meta_keywords: formData.meta_keywords.split(',').map(k => k.trim()),
        category_ids: formData.category_ids,
        tag_ids: formData.tag_ids
      };

      if (id) {
        await blogService.updateBlogPost(id, postData);
      } else {
        await blogService.createBlogPost(postData);
      }

      navigate('/admin/blog');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const handleTagChange = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

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
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
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
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 bg-transparent rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostEditor; 