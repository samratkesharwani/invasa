import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService } from '../utils/blogService';

const Blog = ({ isDarkMode }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Memoize the fetchPosts function
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await blogService.getBlogPosts(page);
      setPosts(data);
      setTotalPages(Math.ceil(count / 10));
    } catch (err) {
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePrevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const handleNextPage = useCallback(() => setPage(p => Math.min(totalPages, p + 1)), [totalPages]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'} flex items-center justify-center`}>
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'} py-12 px-4 sm:px-6 lg:px-8`}>
      <Helmet>
        <title>Blog - Invasa Link</title>
        <meta name="description" content="Read our latest blog posts and insights about print on demand" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Our Blog</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>Discover insights, updates, and stories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} isDarkMode={isDarkMode} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`px-4 py-2 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
            >
              Previous
            </button>
            <span className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`px-4 py-2 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Separate card component for better organization
const BlogCard = ({ post, isDarkMode }) => {
  return (
    <Link 
      to={`/blog/${post.slug}`}
      className={`group ${
        isDarkMode 
          ? 'bg-gray-800 hover:shadow-xl' 
          : 'bg-white hover:shadow-lg border border-gray-200'
      } rounded-lg overflow-hidden shadow-lg transition-shadow duration-300`}
    >
      <div className="relative h-48 overflow-hidden">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
      </div>
      
      <div className="p-6">
        <h2 className={`text-xl font-semibold ${
          isDarkMode 
            ? 'text-white group-hover:text-purple-400' 
            : 'text-gray-900 group-hover:text-purple-600'
        } mb-2 transition-colors duration-300`}>
          {post.title}
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4 line-clamp-3`}>
          {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {post.author && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm">
                    {post.author.email?.[0].toUpperCase() || 'A'}
                  </span>
                </div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm ml-2`}>
                  {post.author.email}
                </span>
              </div>
            )}
          </div>
          <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} text-sm`}>
            {new Date(post.published_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Blog; 