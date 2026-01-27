import React, { useEffect, useState } from "react";
import API_BASE_URL from '../../config/api';
import { useNavigate } from "react-router-dom";
import './InventryValue.css';

const InventryValue = () => {
  const [inventry, setInventry] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventry = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/analysis/inventoryValue`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const data = await response.json();
        setInventry(data.Value);
      } catch (err) {
        setError('Failed to fetch inventory value');
      }
    };
    fetchInventry();
  }, [navigate]);

  if (error) return <div>{error}</div>;
  if (!inventry) return <div>Loading...</div>;

  return (
    <div>
    <div className="container-cc">
    <div className="inventry-value-container">
      <div>
        <h2>Current Inventry Value</h2>
        <h6>*according to selling price's</h6>
        <h3>₹ {inventry.selling_price ?? 0}</h3>
      </div>
      </div>
      <div className="inventry-value-container">
      <div>
        <h2>Current Inventry Investment</h2>
        <h6>*according to cost price's</h6>
        <h3>₹ {inventry.cost_price ?? 0}</h3>
      </div>
      </div>
      </div>
    </div>
  );
};

export default InventryValue;
