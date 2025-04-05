import React from 'react';

const PrintViewer = ({ prints }) => {
  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'print.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {prints.map((print, index) => (
        <div key={index} className="bg-gray-800 dark:bg-gray-900 rounded-lg p-4">
          <div className="mb-4 relative">
            <img
              src={print.imageUrl}
              alt={`Print ${index + 1}`}
              className="object-contain rounded-lg w-full h-48"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {print.position || 'Front'}
            </div>
          </div>
          <div className="space-y-2 text-gray-300">
            <p className="font-semibold text-white">Print #{index + 1}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p>Area:</p>
              <p>{print.area} sq inches</p>
              
              <p>Position:</p>
              <p>{print.position || 'Front'}</p>
              
              {print.designDetails && (
                <>
                  <p>Width:</p>
                  <p>{print.designDetails.width} units</p>
                  
                  <p>Height:</p>
                  <p>{print.designDetails.height} units</p>
                  
                  <p>Coordinates:</p>
                  <p>X: {print.designDetails.x}, Y: {print.designDetails.y}</p>
                </>
              )}
            </div>
            <button
              onClick={() => downloadImage(print.imageUrl, `print-${print.position || 'front'}-${index + 1}.png`)}
              className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Download Image
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintViewer; 