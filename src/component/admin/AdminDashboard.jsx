import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessResponse = await supabase
          .from('businesses')
          .select('email, businessName, ownerName, contactNumber');

        if (businessResponse.error) {
          throw new Error(businessResponse.error.message);
        }

        const productData = businessResponse.data;

        setData(productData);

        console.log('Fetched Data:', productData);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      {data.map((business, index) => (
        <div key={index} className="business-card">
          <h2>business name: {business.businessName}</h2>
          <p><strong>Owner:</strong> {business.ownerName}</p>
          <p><strong>Contact:</strong> {business.contactNumber}</p>
          <p><strong>Email:</strong> {business.email}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
