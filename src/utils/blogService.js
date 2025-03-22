import { supabase } from './supabase';

export const blogService = {
  // Get all published blog posts
  async getBlogPosts(page = 1, limit = 10) {
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

    // Fetch author information separately
    const postsWithAuthors = await Promise.all(
      data.map(async (post) => {
        const { data: authorData } = await supabase.auth.admin.getUserById(post.author_id);
        return {
          ...post,
          author: authorData?.user || null
        };
      })
    );

    return { data: postsWithAuthors, count };
  },

  // Get a single blog post by slug
  async getBlogPost(slug) {
    try {
      const response = await supabase
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
        `)
        .eq('slug', slug)
        .single();
      
      if (response.error) {
        throw response.error;
      }

      // Fetch author information
      if (response.data) {
        const { data: authorData } = await supabase.auth.admin.getUserById(response.data.author_id);
        return {
          ...response.data,
          author: authorData?.user || null
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  // Create a new blog post
  async createBlogPost(postData) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('User not authenticated');

    // Extract category_ids and tag_ids from postData
    const { category_ids, tag_ids, ...postDataWithoutRelations } = postData;

    // Create the blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert([{
        ...postDataWithoutRelations,
        author_id: userData.user.id
      }])
      .select()
      .single();

    if (postError) throw postError;

    // If categories are provided, create the relationships
    if (category_ids && category_ids.length > 0) {
      const categoryRelations = category_ids.map(categoryId => ({
        post_id: post.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('blog_post_categories')
        .insert(categoryRelations);

      if (categoryError) throw categoryError;
    }

    // If tags are provided, create the relationships
    if (tag_ids && tag_ids.length > 0) {
      const tagRelations = tag_ids.map(tagId => ({
        post_id: post.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('blog_post_tags')
        .insert(tagRelations);

      if (tagError) throw tagError;
    }

    // Fetch the complete post with relationships
    const { data: completePost, error: fetchError } = await supabase
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
      `)
      .eq('id', post.id)
      .single();

    if (fetchError) throw fetchError;

    // Fetch author information
    const { data: authorData } = await supabase.auth.admin.getUserById(completePost.author_id);

    return {
      ...completePost,
      author: authorData?.user || null
    };
  },

  // Update a blog post
  async updateBlogPost(id, postData) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a blog post
  async deleteBlogPost(id) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get all tags
  async getTags() {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Add a comment to a blog post
  async addComment(postId, content) {
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
    return data;
  },

  // Get posts by category
  async getPostsByCategory(categorySlug, page = 1, limit = 10) {
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

    // Fetch author information separately
    const postsWithAuthors = await Promise.all(
      data.map(async (post) => {
        const { data: authorData } = await supabase
          .from('auth.users')
          .select('id, email, user_metadata')
          .eq('id', post.author_id)
          .single();
        
        return {
          ...post,
          author: authorData
        };
      })
    );

    return { data: postsWithAuthors, count };
  },

  // Get posts by tag
  async getPostsByTag(tagSlug, page = 1, limit = 10) {
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

    // Fetch author information separately
    const postsWithAuthors = await Promise.all(
      data.map(async (post) => {
        const { data: authorData } = await supabase
          .from('auth.users')
          .select('id, email, user_metadata')
          .eq('id', post.author_id)
          .single();
        
        return {
          ...post,
          author: authorData
        };
      })
    );

    return { data: postsWithAuthors, count };
  }
}; 