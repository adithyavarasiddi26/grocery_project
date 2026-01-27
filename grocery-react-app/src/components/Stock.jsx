import React, { useState,useEffect } from 'react';
import API_BASE_URL from '../config/api';
import './Stock.css';
import CustomTable from './CustomTable';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { red } from '@mui/material/colors';

function Stock() {
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [message, setMessage] = useState('');
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  const [sortValue, setSortValue] = useState('recent');
  const [radioValue, setRadioValue] = useState('ASC');
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const fetchOutOfStockItems = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/stock/outofstock`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setOutOfStockItems(data);
    } catch (error) {
      console.error('Error fetching out of stock items:', error);
    }
  };
  useEffect(() => {
    fetchOutOfStockItems();
  }, [outOfStockItems, quantity]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/stock`, {
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
          const response = await fetch(`${API_BASE_URL}/getstock`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sortBy: sortValue , order: radioValue }), method: 'POST'
          });
          const data = await response.json();
          if (Array.isArray(data)) setStockList(data);
        };
          useEffect(() => {
          fetchStockList();
        }, [sortValue, radioValue]);

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Are you sure you want to Delete?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Stock deleted successfully!');
        fetchStockList();
      } else {
        setMessage(data.error || 'Failed to delete stock');
      }
    } catch (err) {
      setMessage('Network error');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="stock-container">
      <h2 className="stock-title">Stock Information</h2>
      {message && <div className="stock-message">{message}</div>}
      <button className="add-stock-btn" onClick={handleToggleForm}>
        {showForm ? 'Hide Add Stock' : 'Add Stock'}
      </button>
      {showForm && (
        <form className="stock-form" onSubmit={handleAddStock}>
          <div className='addStockInput'>
            <input
              style={{ width: '90%' }}
              type="text"
              placeholder="Product Name"
              value={productName}
            onChange={e => setProductName(e.target.value)}
            required
          />
          </div>
          <div className='addStockInput'>
            <input
              style={{ width: '70%', marginRight: '2%' }}
              onWheel={(e) => e.target.blur()}
              className='quantity-input'
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              min={0}
              step="any"
            />
            <span>Kg/Piece/Litre</span>
          </div>
          <div className='addStockInput'>
          <input
            onWheel={(e) => e.target.blur()}
            className='price-input'
            type="number"
            placeholder="Cost Price"
            value={costPrice}
            onChange={e => setCostPrice(e.target.value)}
            required
            min={0}
            step="any"
          />
          <span style={{fontSize:'25px'}}>₹</span>
          </div>
          <div className='addStockInput'>
          <input
            onWheel={(e) => e.target.blur()}
            className='price-input'
            type="number"
            placeholder="Selling Price"
            value={sellingPrice}
            onChange={e => setSellingPrice(e.target.value)}
            required
            min={0}
            step="any"
          />
          <span style={{fontSize:'25px'}}>₹</span>
          </div>

          <button type="submit">Submit</button>
        </form>
      )}
      {outOfStockItems.length > 0 && (
      <Card style={{background:'#52796F'}}>
        <CardContent>
      
        <div className="out-of-stock-alert">
          <h3 style={{fontWeight:'bold', fontSize:'24px'}}>Out of Stock Items:</h3>
          <ul style={{listStyleType: 'none', padding: 0}}>
            {outOfStockItems.map(item => (
              <li key={item.id}>{item.product_name} <button className='btn-local' onClick={() => handleDeleteStock(item.id)}>Delete Stock</button></li>
              
            ))}
          </ul>
        </div>
      
        </CardContent>
      </Card>
      )}

      <div className="stock-container two">
        {/* ...existing form code... */}
        <h3 style={{fontWeight:'bold',fontSize:'30px'}}>Your Stock</h3>
        <div className='sortBy'>
        <h5 style={{fontWeight:'bold'}}>Sort by</h5>
        {/* <select value={sortValue} onChange={e => setSortValue(e.target.value)} >
          <option value="recent">Recently Added</option>
          <option value="product_name">Product Name</option>
          <option value="quantity">Quantity</option>
          <option value="costprice">Cost Price</option>
          <option value="sellingprice">Selling Price</option>
        </select> */}

         <FormControl sx={{ m: 1, minWidth: 120, background:'white', borderRadius:'8px' }} size="small">
          <Select
            labelId="sort-by-label"
            id="sort-by-select"
            value={sortValue}
            onChange={e => setSortValue(e.target.value)}
          >
            <MenuItem value="recent">Recently Added</MenuItem>
            <MenuItem value="product_name">Product Name</MenuItem>
            <MenuItem value="quantity">Quantity</MenuItem>
            <MenuItem value="costprice">Cost Price</MenuItem>
            <MenuItem value="sellingprice">Selling Price</MenuItem>
          </Select>
         </FormControl>
        </div>
                  <RadioGroup sx={{'& .Mui-checked': { color: red[900] } }} row value={radioValue} onChange={e => setRadioValue(e.target.value)} >
                    <FormControlLabel value="ASC" control={<Radio />} label="Ascending" />
                    <FormControlLabel value="DESC" control={<Radio />} label="Descending" />
                  </RadioGroup>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{marginBottom:'1rem', padding:'8px', width:'60%'}}
            />
            <CustomTable stockList={stockList.filter(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))} refreshStockList={fetchStockList} />
          </div>
      {/* ...existing code for displaying stock... */}
        
    </div>
  );
}
export default Stock;
