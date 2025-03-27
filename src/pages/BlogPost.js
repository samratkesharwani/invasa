import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService } from '../utils/blogService';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeContext } from '../context/ThemeContext';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogService.getBlogPost(slug);
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post.title;
    const text = post.excerpt || post.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        <ThemeToggle />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Post not found'}</div>
          <Link
            to="/blog"
            className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
          >
            Return to Blog
          </Link>
        </div>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Helmet>
        <title>{post.title} - Your Company Name</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
      </Helmet>

      <ThemeToggle />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Card */}
        <div className="b2b-card rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {/* Hero Section */}
          <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover transform scale-105 transition-transform duration-700 hover:scale-100"
              />
            ) : (
              <div className="w-full h-full b2b-gradient flex items-center justify-center">
                <span className="text-6xl text-white/20">📸</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  {post.title}
                </h1>
                {post.author && (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 rounded-full b2b-gradient flex items-center justify-center ring-2 ring-purple-500/20">
                      <span className="text-white text-lg font-medium">
                        {post.author.email?.[0].toUpperCase() || 'A'}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }} className="text-lg">
                      {post.author.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Categories and Tags */}
            <div className="flex flex-wrap gap-2 mb-12">
              {post.categories?.map(({ category }) => (
                <span
                  key={category.id}
                  className="px-4 py-2 bg-purple-900/20 text-purple-200 rounded-full text-sm border border-purple-500/10"
                >
                  {category.name}
                </span>
              ))}
              {post.tags?.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-4 py-2 bg-opacity-30 rounded-full text-sm border border-opacity-30"
                  style={{ 
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(243, 244, 246, 0.7)',
                    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.4)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Blog Content */}
            <div className="mx-auto mt-8 px-4 sm:px-6 max-w-none">
              <div 
                className="blog-content prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary-light prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </div>

            {/* Share Section */}
            <div className="border-t pt-8" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Share this post</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-3 rounded-lg transition-all duration-300 border"
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.7)',
                      borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.4)',
                      color: 'var(--text-secondary)'
                    }}
                    aria-label="Share options"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  
                  {/* Share Menu */}
                  {showShareMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-[100]"
                        onClick={() => setShowShareMenu(false)}
                      />
                      {/* Menu */}
                      <div className="fixed right-4 sm:right-8 top-[70%] -translate-y-1/2 w-64 rounded-lg shadow-2xl border py-2 z-[101]"
                        style={{ 
                          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Share via</h4>
                        </div>
                        <div className="py-2 max-h-[60vh] overflow-y-auto">
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors duration-200 flex items-center"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            Twitter
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors duration-200 flex items-center"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <svg className="w-5 h-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors duration-200 flex items-center"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <svg className="w-5 h-5 mr-3 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors duration-200 flex items-center"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </button>
                          <button
                            onClick={() => handleShare('email')}
                            className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors duration-200 flex items-center"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </button>
                        </div>
                        <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              setShowShareMenu(false);
                            }}
                            className="w-full text-left hover:text-primary transition-colors duration-200 flex items-center"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Link
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promotional Component */}
        <div className="mt-24">
          <div className="b2b-card b2b-gradient rounded-2xl p-12 relative overflow-hidden backdrop-blur-sm border border-purple-500/10">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Transform Your Clothing Business
                </h2>
                <p className="text-xl text-gray-200 mb-10">
                Join successful brands that deliver faster than their competitors and dominate the market game.
                </p>
                <button
                  onClick={() => navigate('/register')}
                  className="px-12 py-4 bg-white text-purple-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                </button>
                <div className="mt-12 flex items-center justify-center space-x-8 text-gray-300">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for blog content */}
      <style jsx="true">{`
        .blog-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
          color: var(--text-primary);
        }
        
        .blog-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          color: var(--text-primary);
        }
        
        .blog-content h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          color: var(--text-primary);
        }
        
        .blog-content h4 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          line-height: 1.5;
          color: var(--text-primary);
        }
        
        .blog-content h5 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.5;
          color: var(--text-primary);
        }
        
        .blog-content h6 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.5;
          color: var(--text-primary);
        }
        
        .blog-content p {
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        
        .blog-content a {
          color: var(--primary-light);
          text-decoration: underline;
        }
        
        .blog-content ul, .blog-content ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding-left: 2rem;
          color: var(--text-secondary);
        }
        
        .blog-content ul {
          list-style-type: disc;
        }
        
        .blog-content ol {
          list-style-type: decimal;
        }
        
        .blog-content img {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          max-width: 100%;
        }
        
        .blog-content blockquote {
          border-left: 4px solid var(--primary-light);
          padding-left: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
          color: var(--text-muted);
        }
        
        .blog-content pre {
          background-color: var(--bg-secondary);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .blog-content code {
          background-color: var(--bg-secondary);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default BlogPost;