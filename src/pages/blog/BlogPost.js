import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService } from '../../utils/blogService';
import toast from 'react-hot-toast';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const data = await blogService.getBlogPost(slug);
      setPost(data);
    } catch (error) {
      toast.error('Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await blogService.getPostComments(slug);
      setComments(data);
    } catch (error) {
      toast.error('Failed to fetch comments');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await blogService.createComment(slug, comment);
      setComment('');
      fetchComments();
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
          <Link to="/blog" className="text-indigo-400 hover:text-indigo-300">
            Return to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.featured_image && (
          <meta property="og:image" content={post.featured_image} />
        )}
      </Helmet>

      <article className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              {post.categories?.map((cat) => (
                <Link
                  key={cat.category.id}
                  to={`/blog/category/${cat.category.slug}`}
                  className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-900/50 rounded-full hover:bg-indigo-900/70 transition-colors"
                >
                  {cat.category.name}
                </Link>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center space-x-4">
                {post.author && (
                  <span>
                    By {post.author.user_metadata?.full_name || post.author.email}
                  </span>
                )}
                <span>•</span>
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString()}
                </time>
              </div>
              <div className="flex items-center space-x-4">
                {post.tags?.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/blog/tag/${tag.slug}`}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Comments Section */}
          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {comment.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {comment.user.user_metadata?.full_name || comment.user.email}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-400 text-center py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </section>
        </div>
      </article>
    </>
  );
};

export default BlogPost; 