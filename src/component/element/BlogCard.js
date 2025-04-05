import React from 'react';
import { Link } from 'react-router-dom';
import IconContainer from '../IconContainer';
import { useTheme } from '../../contexts/ThemeContext';

const BlogCard = ({ post }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <article className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 text-white">
      {post.featured_image && (
        <div className="relative h-48">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories?.map(({ category }) => (
            <Link
              key={category.id}
              to={`/blog/category/${category.slug}`}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <h2 className="text-xl font-bold mb-2">
          <Link to={`/blog/${post.slug}`} className="hover:text-purple-400 transition-colors duration-300">
            {post.title}
          </Link>
        </h2>
        <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}</p>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center">
            {post.author?.user_metadata?.avatar_url ? (
              <img
                src={post.author.user_metadata.avatar_url}
                alt={post.author.email}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <IconContainer
                icon={<span className="text-xs">{post.author?.email?.[0]?.toUpperCase() || 'A'}</span>}
                size="sm"
                isDarkMode={isDarkMode}
                color="purple"
                alt={post.author?.email || 'Author'}
              />
            )}
            <span className="ml-2">{post.author?.email}</span>
          </div>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString()}
            </time>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard; 