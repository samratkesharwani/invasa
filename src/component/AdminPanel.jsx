import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const AdminPanel = () => {
  const [pendingPosts, setPendingPosts] = useState([]);

  useEffect(() => {
    const fetchPendingPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "pending");

      if (error) console.error("Error fetching posts:", error);
      else setPendingPosts(data);
    };

    fetchPendingPosts();
  }, []);

  const handleApproval = async (postId, status) => {
    const { error } = await supabase
      .from("posts")
      .update({ status })
      .eq("id", postId);

    if (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    } else {
      setPendingPosts(pendingPosts.filter((post) => post.id !== postId));
    }
  };

  return (
    <div>
      <h2>Admin Panel - Approve Posts</h2>
      {pendingPosts.length === 0 ? (
        <p>No pending posts.</p>
      ) : (
        pendingPosts.map((post) => (
          <div key={post.id}>
            <p>{post.content}</p>
            <button onClick={() => handleApproval(post.id, "approved")}>
              Approve
            </button>
            <button onClick={() => handleApproval(post.id, "rejected")}>
              Reject
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPanel;
