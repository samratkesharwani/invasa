import { supabase } from './supabase';

// Simple in-memory cache to reduce repeated requests
const cache = {
  categories: null,
  tags: null,
  postsCache: new Map(),
  // Cache expiration time (5 minutes)
  expiry: 5 * 60 * 1000,
  categoriesTimestamp: 0,
  tagsTimestamp: 0
};

// Helper function to ensure valid dates and prevent 1/1/1970
const ensureValidDate = (dateField) => {
  if (!dateField || new Date(dateField).getFullYear() < 2000) {
    return new Date().toISOString();
  }
  return dateField;
};

export const blogService = {
  // Get all published blog posts
  async getBlogPosts(page = 1, limit = 10) {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      const { data, error, count } = await supabase
        .from('blog_posts')
        .select(`
          *,
          categories:blog_post_categories (
            category:blog_categories (
              id,
              name,
              slug
            )
          ),
          tags:blog_post_tags (
            tag:blog_tags (
              id,
              name,
              slug
            )
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      // Use a Promise.all to request all authors in parallel
      const authorIds = [...new Set(data.map(post => post.author_id))];
      const authorsResponse = await Promise.all(
        authorIds.map(id => supabase.auth.admin.getUserById(id))
      );
      
      // Create a map of author data for quick lookup
      const authorsMap = {};
      authorsResponse.forEach((response, index) => {
        if (response.data?.user) {
          authorsMap[authorIds[index]] = response.data.user;
        }
      });
      
      // Attach authors to posts and ensure valid dates
      const postsWithAuthors = data.map(post => ({
        ...post,
        published_at: ensureValidDate(post.published_at),
        created_at: ensureValidDate(post.created_at),
        updated_at: ensureValidDate(post.updated_at),
        author: authorsMap[post.author_id] || null
      }));

      return { data: postsWithAuthors, count };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },

  // Get a single blog post by id or slug
  async getBlogPost(identifier) {
    try {
      // Check if the post is in cache
      if (cache.postsCache.has(identifier)) {
        const { post, timestamp } = cache.postsCache.get(identifier);
        // If cache is fresh, return it
        if (Date.now() - timestamp < cache.expiry) {
          return post;
        }
        // Otherwise continue to fetch fresh data
      }
      
      // Check if identifier is a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Build the query
      let { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq(uuidRegex.test(identifier) ? 'id' : 'slug', identifier)
        .maybeSingle();
      
      if (error) throw error;
      if (!post) return null;
      
      // Use Promise.all to get categories and tags in parallel
      const [categoriesResult, tagsResult] = await Promise.all([
        supabase
          .from('blog_post_categories')
          .select(`
            category:blog_categories (
              id,
              name,
              slug
            )
          `)
          .eq('post_id', post.id),
          
        supabase
          .from('blog_post_tags')
          .select(`
            tag:blog_tags (
              id,
              name,
              slug
            )
          `)
          .eq('post_id', post.id)
      ]);
      
      if (categoriesResult.error) throw categoriesResult.error;
      if (tagsResult.error) throw tagsResult.error;
      
      // Ensure valid dates
      post.published_at = ensureValidDate(post.published_at);
      post.created_at = ensureValidDate(post.created_at);
      post.updated_at = ensureValidDate(post.updated_at);
      
      // Combine all data
      const fullPost = {
        ...post,
        categories: categoriesResult.data || [],
        tags: tagsResult.data || []
      };
      
      // Store in cache
      cache.postsCache.set(identifier, {
        post: fullPost,
        timestamp: Date.now()
      });
      
      return fullPost;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  // Create a new blog post
  async createBlogPost(postData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error('User not authenticated');

      // Extract category_ids and tag_ids from postData
      const { category_ids, tag_ids, ...postDataWithoutRelations } = postData;

      // Ensure dates are set and valid
      const now = new Date().toISOString();
      const dataWithDates = {
        ...postDataWithoutRelations,
        created_at: now,
        updated_at: now,
        published_at: postDataWithoutRelations.status === 'published' ? now : null
      };

      // Create the blog post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert([{
          ...dataWithDates,
          author_id: userData.user.id
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Create relationships in parallel
      const relationPromises = [];
      
      // Add category relationships if provided
      if (category_ids && category_ids.length > 0) {
        const categoryRelations = category_ids.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }));

        relationPromises.push(
          supabase.from('blog_post_categories').insert(categoryRelations)
        );
      }

      // Add tag relationships if provided
      if (tag_ids && tag_ids.length > 0) {
        const tagRelations = tag_ids.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));

        relationPromises.push(
          supabase.from('blog_post_tags').insert(tagRelations)
        );
      }

      // Wait for all relationship creations to complete
      const relationResults = await Promise.all(relationPromises);
      
      // Check for errors
      relationResults.forEach(result => {
        if (result.error) throw result.error;
      });

      // Return post with relationships and ensure dates are valid
      return {
        ...post,
        published_at: ensureValidDate(post.published_at),
        created_at: ensureValidDate(post.created_at),
        updated_at: ensureValidDate(post.updated_at),
        categories: category_ids ? category_ids.map(id => ({ category: { id } })) : [],
        tags: tag_ids ? tag_ids.map(id => ({ tag: { id } })) : []
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  },

  // Update a blog post
  async updateBlogPost(id, postData) {
    try {
      // First check if the post exists
      const { data: existingPost, error: checkError } = await supabase
        .from('blog_posts')
        .select('id, author_id, status')
        .eq('id', id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (!existingPost) throw new Error('Blog post not found');

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData?.user?.id) throw new Error('User not authenticated');

      // Extract category_ids and tag_ids from postData
      const { category_ids, tag_ids, ...postDataWithoutRelations } = postData;
      
      // Prepare data with current timestamp for updated_at
      const now = new Date().toISOString();
      const dataWithDates = {
        ...postDataWithoutRelations,
        updated_at: now,
        // Set published_at if status changed from draft to published
        published_at: (existingPost.status !== 'published' && postDataWithoutRelations.status === 'published') 
          ? now 
          : (postDataWithoutRelations.published_at || null)
      };

      // Update the blog post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .update(dataWithDates)
        .eq('id', id)
        .select();

      if (postError) throw postError;

      // Update relationships in parallel
      const relationPromises = [
        // Delete existing relationship
        supabase.from('blog_post_categories').delete().eq('post_id', id),
        supabase.from('blog_post_tags').delete().eq('post_id', id)
      ];

      // Wait for deletions to complete
      await Promise.all(relationPromises);

      // Create new relationships if needed
      const createRelationPromises = [];

      // Add category relationships if provided
      if (category_ids && category_ids.length > 0) {
        const categoryRelations = category_ids.map(categoryId => ({
          post_id: id,
          category_id: categoryId
        }));

        createRelationPromises.push(
          supabase.from('blog_post_categories').insert(categoryRelations)
        );
      }

      // Add tag relationships if provided
      if (tag_ids && tag_ids.length > 0) {
        const tagRelations = tag_ids.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));

        createRelationPromises.push(
          supabase.from('blog_post_tags').insert(tagRelations)
        );
      }

      // Wait for all relationship creations to complete
      if (createRelationPromises.length > 0) {
        await Promise.all(createRelationPromises);
      }

      // Clear the post from cache
      cache.postsCache.delete(id);
      
      // Make sure we have a valid post object with valid dates
      const updatedPost = post && post[0] ? {
        ...post[0],
        published_at: ensureValidDate(post[0].published_at),
        created_at: ensureValidDate(post[0].created_at),
        updated_at: ensureValidDate(post[0].updated_at),
      } : {};
      
      // Return updated post with relationships
      return {
        ...updatedPost,
        categories: category_ids ? category_ids.map(id => ({ category: { id } })) : [],
        tags: tag_ids ? tag_ids.map(id => ({ tag: { id } })) : []
      };
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  },

  // Delete a blog post
  async deleteBlogPost(id) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Clear the post from cache
      cache.postsCache.delete(id);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  },

  // Get all categories
  async getCategories() {
    try {
      // Return cached data if available and fresh
      if (cache.categories && (Date.now() - cache.categoriesTimestamp < cache.expiry)) {
        return cache.categories;
      }
      
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Update cache
      cache.categories = data;
      cache.categoriesTimestamp = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get all tags
  async getTags() {
    try {
      // Return cached data if available and fresh
      if (cache.tags && (Date.now() - cache.tagsTimestamp < cache.expiry)) {
        return cache.tags;
      }
      
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Update cache
      cache.tags = data;
      cache.tagsTimestamp = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // Add a comment to a blog post
  async addComment(postId, content) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_comments')
        .insert([{
          post_id: postId,
          content,
          user_id: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Clear the post from cache since it has new comments
      cache.postsCache.delete(postId);
      
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get posts by category
  async getPostsByCategory(categorySlug, page = 1, limit = 10) {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await supabase
        .from('blog_posts')
        .select(`
          *,
          categories:blog_post_categories (
            category:blog_categories (
              id,
              name,
              slug
            )
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .eq('categories.category.slug', categorySlug)
        .order('published_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      // Use a Promise.all to request all authors in parallel
      const authorIds = [...new Set(data.map(post => post.author_id))];
      const authorsResponse = await Promise.all(
        authorIds.map(id => supabase.from('auth.users').select('id, email, user_metadata').eq('id', id).single())
      );
      
      // Create a map of author data for quick lookup
      const authorsMap = {};
      authorsResponse.forEach((response, index) => {
        if (!response.error && response.data) {
          authorsMap[authorIds[index]] = response.data;
        }
      });
      
      // Attach authors to posts
      const postsWithAuthors = data.map(post => ({
        ...post,
        author: authorsMap[post.author_id] || null
      }));

      return { data: postsWithAuthors, count };
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      throw error;
    }
  },

  // Get posts by tag
  async getPostsByTag(tagSlug, page = 1, limit = 10) {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await supabase
        .from('blog_posts')
        .select(`
          *,
          tags:blog_post_tags (
            tag:blog_tags (
              id,
              name,
              slug
            )
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .eq('tags.tag.slug', tagSlug)
        .order('published_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      // Use a Promise.all to request all authors in parallel
      const authorIds = [...new Set(data.map(post => post.author_id))];
      const authorsResponse = await Promise.all(
        authorIds.map(id => supabase.from('auth.users').select('id, email, user_metadata').eq('id', id).single())
      );
      
      // Create a map of author data for quick lookup
      const authorsMap = {};
      authorsResponse.forEach((response, index) => {
        if (!response.error && response.data) {
          authorsMap[authorIds[index]] = response.data;
        }
      });
      
      // Attach authors to posts
      const postsWithAuthors = data.map(post => ({
        ...post,
        author: authorsMap[post.author_id] || null
      }));

      return { data: postsWithAuthors, count };
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      throw error;
    }
  }
}; 