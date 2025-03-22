import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService } from '../../utils/blogService';
import toast from 'react-hot-toast';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const { data, count } = await blogService.getBlogPosts(page, postsPerPage);
      setPosts(data);
      setTotalPages(Math.ceil(count / postsPerPage));
    } catch (error) {
      toast.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog - Latest Posts</title>
        <meta name="description" content="Read our latest blog posts" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Our Blog</h1>
            <p className="text-xl text-gray-400">Discover our latest articles and insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {post.categories?.map((cat) => (
                      <span
                        key={cat.category.id}
                        className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-900/50 rounded-full"
                      >
                        {cat.category.name}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-indigo-400 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {post.author && (
                        <span className="text-sm text-gray-400">
                          By {post.author.user_metadata?.full_name || post.author.email}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      page === p
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList; 