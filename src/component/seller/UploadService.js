export const uploadFile = async (file) => {
  const R2_BUCKET_URL = "https://050f224b20162fafa27ae20c3371a530.r2.cloudflarestorage.com/printimgs";

  try {
    const response = await fetch(`${R2_BUCKET_URL}/${file.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return `${R2_BUCKET_URL}/${file.name}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
