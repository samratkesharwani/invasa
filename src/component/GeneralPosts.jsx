import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const GeneralPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching posts:", error);
      else setPosts(data);
    };

    fetchApprovedPosts();
  }, []);

  return (
    <div>
      <h2>General Posts</h2>
      {posts.length === 0 ? (
        <p>No approved posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default GeneralPosts;
