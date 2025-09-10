import React, { useState,useEffect } from 'react';
import './Stock.css';
import CustomTable from './CustomTable';


function Stock() {
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [message, setMessage] = useState('');

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: productName,
          quantity: parseFloat(quantity),
          costprice: parseFloat(costPrice),
          sellingprice: parseFloat(sellingPrice)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Stock added successfully!');
        // Refresh the stock list
        fetchStockList();
      } else {
        setMessage(data.error || 'Failed to add stock');
      }
    } catch (err) {
      setMessage('Network error');
    }
    setProductName('');
    setQuantity('');
    setCostPrice('');
    setSellingPrice('');
    setShowForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const [stockList, setStockList] = useState([]);
          const fetchStockList = async () => {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/stock', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (Array.isArray(data)) setStockList(data);
        };
          useEffect(() => {
          fetchStockList();
        }, []);

  return (
    <div className="stock-container">
      <h2 className="stock-title">Stock Information</h2>
      {message && <div className="stock-message">{message}</div>}
      <button className="add-stock-btn" onClick={handleToggleForm}>
        {showForm ? 'Hide Add Stock' : 'Add Stock'}
      </button>
      {showForm && (
        <form className="stock-form" onSubmit={handleAddStock}>
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            required
          />
          <input
            className='quantity-input'
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
            min={0}
            step="any"
          />
          <input
            className='price-input'
            type="number"
            placeholder="Cost Price"
            value={costPrice}
            onChange={e => setCostPrice(e.target.value)}
            required
            min={0}
            step="any"
          />
          <input
            className='price-input'
            type="number"
            placeholder="Selling Price"
            value={sellingPrice}
            onChange={e => setSellingPrice(e.target.value)}
            required
            min={0}
            step="any"
          />

          <button type="submit">Submit</button>
        </form>
      )}

      
          <div className="stock-container">
            {/* ...existing form code... */}
            <h3 style={{marginTop: '2rem'}}>Your Stock</h3>
            <CustomTable stockList={stockList} refreshStockList={fetchStockList} />
          </div>
      {/* ...existing code for displaying stock... */}
        
    </div>
  );
}
export default Stock;
