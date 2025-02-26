// src/Geocode.js
import React, { useState } from 'react';
import axios from 'axios';

const Geocode = () => {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);

  const apiKey = process.env.REACT_APP_OPEN_CAGE_KEY;

  const handleGeocode = async () => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const { lat, lng } = response.data.results[0].geometry;
      setCoordinates({ lat, lng });
    } catch (error) {
      console.error('Error fetching geocode data:', error);
    }
  };

  return (
    <div>
      <h1>Geocode Address</h1>
      <input
        type="text"
        value={address}
        className="border dark:bg-dark-2 text-white"
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter address"
      />
      <button onClick={handleGeocode}>Get Coordinates</button>
      {coordinates && (
        <div>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lng}</p>
        </div>
      )}
    </div>
  );
};

export default Geocode;
