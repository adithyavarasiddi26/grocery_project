import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import './LowStockItems.css';

const LowStockItems = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [selectedQty, setSelectedQty] = useState(5);
    const fetchLowStockItems = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analysis/lowStockItems`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }, method: 'POST',
        body: JSON.stringify({ threshold: selectedQty })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setLowStockItems(data.items || []);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setLowStockItems([]);
    }
  }


  const handleChange = (event) => {
    setSelectedQty(event.target.value);
  }

  useEffect(() => {
    fetchLowStockItems();
  }, [selectedQty]);
  return (
    <div>
      <div className='container-cc'>
        <div className='total-sale-container'>
      {/* Inventory analysis charts and reports go here */}

        <h2>Low Stock</h2>
        {/* Stock levels chart */}
        <div className='threshold-container'>
          <label>Threshold</label>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Quantity</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedQty}
                label="Quantity"
                onChange={handleChange}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>

        </div>
        </div>
        <div className='total-sale-container'>
        <TableContainer 
          sx={{width:'100%'}}
          component={Paper}
        >
          <Table
            sx={{ minWidth: "50px",background:'#CAD2C5' }}
            size="small"
            aria-label="a dense table"
          >
            <TableHead sx={{background:'#9ba197ff'}}>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lowStockItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No low stock items found
                  </TableCell>
                </TableRow>
              )}
              {lowStockItems.map((item) => (
                <TableRow
                  key={item.product_name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.product_name}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      </div>
    </div>
  );
}

export default LowStockItems;