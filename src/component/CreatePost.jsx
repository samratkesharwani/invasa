import React, { useState } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "./AuthProvider";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const authUser = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) return alert("You need to be logged in!");

    setLoading(true);

    const { data, error } = await supabase.from("posts").insert([
      {
        user_id: authUser.id,
        content,
        status: "pending", // New posts are pending approval
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error creating post:", error);
      alert("Failed to submit post.");
    } else {
      setContent("");
      alert("Post submitted for approval!");
    }
  };

  return (
    <div>
      <h2>Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post..."
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
