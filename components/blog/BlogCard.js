import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BlogCard = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {post.featured_image && (
        <div className="relative h-48">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {post.categories?.map(({ category }) => (
            <Link
              key={category.id}
              to={`/blog/category/${category.slug}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <h2 className="text-xl font-bold mb-2">
          <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
            {post.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            {post.author?.user_metadata?.avatar_url && (
              <img
                src={post.author.user_metadata.avatar_url}
                alt={post.author.email}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <span>{post.author?.email}</span>
          </div>
          {/* <time dateTime={post.published_at}>
            {format(new Date(post.published_at), 'MMM d, yyyy')}
          </time> */}
        </div>
      </div>
    </article>
  );
};

export default BlogCard; 