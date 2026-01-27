import React, { useEffect } from 'react';
import API_BASE_URL from '../../config/api';
import './CustomerCount.css';

const CustomerCount = () => {
    const [customerCount, setCustomerCount] = React.useState(0);
    const fetchCustomerCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analysis/customerCount`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }, method: 'GET'
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setCustomerCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching customer count:', error);
      setCustomerCount(0);
    }
  }
  useEffect(() => {
    fetchCustomerCount();
  }, []);
    return (
      <div className='container-cc'>
        <div className='customer-count'>
          <h3>Customers Count:</h3>
        </div>
        <div className='customer-count value'>
          <h1>{customerCount}</h1>
        </div>
        </div>
    );
}

export default CustomerCount;
