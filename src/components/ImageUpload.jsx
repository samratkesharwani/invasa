import React, { useState } from 'react';

const ImageUpload = ({ onUploadComplete }) => {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('file');

    if (!file) {
      showStatus('Please select an image file.', 'error');
      return;
    }

    showStatus('Uploading image...', '');

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showStatus(result.message, 'success');
        setUploadedUrl(result.fileUrl);
        if (onUploadComplete) {
          onUploadComplete(result.fileUrl);
        }
      } else {
        showStatus(`Error: ${result.message || 'Upload failed'}`, 'error');
      }
    } catch (error) {
      showStatus(`Network error: ${error.message}`, 'error');
    }
  };

  const showStatus = (message, type) => {
    setStatus(message);
    setStatusType(type);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
        <div>
          <label className="block text-white mb-2">Select an image file:</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full text-white bg-gray-700 rounded p-2"
          />
        </div>

        {preview && (
          <div className="mt-4">
            <h3 className="text-white mb-2">Image Preview:</h3>
            <img src={preview} alt="Preview" className="max-h-64 mx-auto border border-gray-600 rounded" />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Upload Image
        </button>
      </form>

      {status && (
        <div className={`mt-4 p-3 rounded ${
          statusType === 'success' ? 'bg-green-100 text-green-800' : 
          statusType === 'error' ? 'bg-red-100 text-red-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white mb-2">Image URL:</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="flex-1 bg-gray-700 text-white p-2 rounded"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="mt-4">
            <h3 className="text-white mb-2">Uploaded Image:</h3>
            <img src={uploadedUrl} alt="Uploaded" className="max-h-64 mx-auto border border-gray-600 rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 