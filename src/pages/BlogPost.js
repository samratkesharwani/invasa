import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogService } from '../utils/blogService';
import ThemeToggle from '../component/element/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const BlogPost = ({ isDarkMode }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

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
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'}`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Post not found'}</div>
          <Link
            to="/blog"
            className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
          >
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f5f9fa]'}`}>
      <Helmet>
        <title>{post.title} - Invasa Link</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Card */}
        <div className={`rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm ${isDarkMode ? 'shadow-xl bg-black bg-opacity-60' : 'shadow-md bg-white border border-gray-200'}`}>
          {/* Hero Section */}
          <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover transform scale-105 transition-transform duration-700 hover:scale-100"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <span className="text-6xl text-gray-400">📸</span>
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ${isDarkMode ? 'bg-purple-900 ring-purple-500/20' : 'bg-purple-100 ring-purple-300/20'}`}>
                      <span className="text-white text-lg font-medium">
                        {post.author.email?.[0].toUpperCase() || 'A'}
                      </span>
                    </div>
                    <span className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  className={`px-4 py-2 rounded-full text-sm border ${
                    isDarkMode 
                      ? 'bg-purple-900/20 text-purple-200 border-purple-500/10' 
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}
                >
                  {category.name}
                </span>
              ))}
              {post.tags?.map(({ tag }) => (
                <span
                  key={tag.id}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 border-gray-700' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Blog Content */}
            <div className="mx-auto mt-8 px-4 sm:px-6 max-w-none">
              <div 
                className={`blog-content prose prose-lg max-w-none ${
                  isDarkMode 
                    ? 'prose-invert prose-headings:text-white prose-a:text-purple-300 prose-p:text-gray-200 prose-li:text-gray-200' 
                    : 'prose-headings:text-gray-900 prose-a:text-purple-700 prose-p:text-gray-700 prose-li:text-gray-700'
                } prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg`}
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </div>

            {/* Share Section */}
            <div className={`border-t pt-8 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Share this post</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`p-3 rounded-lg transition-all duration-300 border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-300' 
                        : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}
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
                      <div className={`fixed right-4 sm:right-8 top-[70%] -translate-y-1/2 w-64 rounded-lg shadow-2xl border py-2 z-[101] ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}
                      >
                        <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Share via</h4>
                        </div>
                        <div className="py-2 max-h-[60vh] overflow-y-auto">
                          <ShareButton platform="twitter" handleShare={handleShare} isDarkMode={isDarkMode} />
                          <ShareButton platform="facebook" handleShare={handleShare} isDarkMode={isDarkMode} />
                          <ShareButton platform="linkedin" handleShare={handleShare} isDarkMode={isDarkMode} />
                          <ShareButton platform="whatsapp" handleShare={handleShare} isDarkMode={isDarkMode} />
                          <ShareButton platform="email" handleShare={handleShare} isDarkMode={isDarkMode} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Back to Blog */}
            <div className="mt-12 text-center">
              <Link
                to="/blog"
                className={`inline-flex items-center ${
                  isDarkMode 
                    ? 'text-purple-400 hover:text-purple-300' 
                    : 'text-purple-600 hover:text-purple-800'
                } transition-colors duration-300`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareButton = ({ platform, handleShare, isDarkMode }) => {
  let icon;
  let color;
  
  switch (platform) {
    case 'twitter':
      icon = <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
      break;
    case 'facebook':
      icon = <svg className="w-5 h-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      break;
    case 'linkedin':
      icon = <svg className="w-5 h-5 mr-3 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
      break;
    case 'whatsapp':
      icon = <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
      break;
    case 'email':
      icon = <svg className="w-5 h-5 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
      break;
    default:
      icon = null;
  }
  
  return (
    <button
      onClick={() => handleShare(platform)}
      className={`w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors duration-200 flex items-center ${
        isDarkMode 
          ? 'hover:bg-gray-800 text-gray-300' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      {icon}
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </button>
  );
};

export default BlogPost;