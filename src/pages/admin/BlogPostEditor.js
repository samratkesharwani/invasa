import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { blogService } from '../../utils/blogService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BlogPostEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    published_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
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
          if (post) {
            setFormData({
              ...post,
              published_at: post.published_at ? format(new Date(post.published_at), "yyyy-MM-dd'T'HH:mm:ss") : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
              category_ids: post.categories?.map(c => c.category.id) || [],
              tag_ids: post.tags?.map(t => t.tag.id) || []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        meta_description: formData.meta_description,
        status: formData.status,
        featured_image: formData.featured_image,
        category_ids: formData.category_ids,
        tag_ids: formData.tag_ids,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null
      };

      if (id) {
        await blogService.updateBlogPost(id, postData);
        toast.success('Blog post updated successfully');
      } else {
        await blogService.createBlogPost(postData);
        toast.success('Blog post created successfully');
      }
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        featured_image: file
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      category_ids: e.target.checked
        ? [...prev.category_ids, categoryId]
        : prev.category_ids.filter(id => id !== categoryId)
    }));
  };

  const handleTagChange = (e) => {
    const tagId = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      tag_ids: e.target.checked
        ? [...prev.tag_ids, tagId]
        : prev.tag_ids.filter(id => id !== tagId)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{id ? 'Edit Post' : 'New Post'} - Admin Dashboard</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            {id ? 'Edit Post' : 'New Post'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Published Date */}
            <div>
              <label htmlFor="published_at" className="block text-sm font-medium text-gray-300 mb-2">
                Published Date
              </label>
              <input
                type="datetime-local"
                id="published_at"
                name="published_at"
                value={formData.published_at}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <ReactQuill
                  value={formData.content}
                  onChange={handleContentChange}
                  className="h-96"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  theme="snow"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={handleCategoryChange}
                      value={category.id}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tags.map(tag => (
                  <label key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.tag_ids.includes(tag.id)}
                      onChange={handleTagChange}
                      value={tag.id}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-300">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Meta Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  id="meta_keywords"
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/blog')}
                className="px-4 py-2 bg-gray-700 text-black rounded-lg hover:bg-gray-600 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom styles for ReactQuill */}
      <style>
        {`
          .ql-container {
            background-color: #374151;
            color: white;
            border-color: #4B5563;
            min-height: 200px;
          }
          .ql-toolbar {
            background-color: #1F2937;
            border-color: #4B5563;
          }
          .ql-editor {
            color: white;
          }
          .ql-editor.ql-empty::before {
            color: #9CA3AF;
          }
          .ql-stroke {
            stroke: #9CA3AF;
          }
          .ql-fill {
            fill: #9CA3AF;
          }
          .ql-picker {
            color: #9CA3AF;
          }
          .ql-picker-options {
            background-color: #1F2937;
            color: white;
            border-color: #4B5563;
          }
          .ql-active .ql-stroke {
            stroke: #8B5CF6;
          }
          .ql-active .ql-fill {
            fill: #8B5CF6;
          }
          .ql-active .ql-picker {
            color: #8B5CF6;
          }
        `}
      </style>
    </div>
  );
};

export default BlogPostEditor;