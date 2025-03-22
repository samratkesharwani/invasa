import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService } from '../utils/blogService';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, count } = await blogService.getBlogPosts(page);
        setPosts(data);
        setTotalPages(Math.ceil(count / 10));
        setLoading(false);
      } catch (err) {
        setError('Failed to load blog posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Blog - Your Company Name</title>
        <meta name="description" content="Read our latest blog posts and insights" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Our Blog</h1>
          <p className="text-gray-400 text-lg">Discover insights, updates, and stories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
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
                        <span className="text-gray-400 text-sm ml-2">
                          {post.author.email}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {/* {new Date(post.published_at).toLocaleDateString()} */}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-300"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog; 