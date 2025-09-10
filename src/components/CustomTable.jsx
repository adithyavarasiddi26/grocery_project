// import React from 'react';
import './CustomTable.css';
import * as React from 'react';
import PropTypes from 'prop-types';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


function CustomTable(props) {
  const { stockList } = props;
  const [openRows, setOpenRows] = React.useState({});
  const [editRows, setEditRows] = React.useState({
    product_name: '',
    quantity: '',
    costprice: '',
    sellingprice: ''
  });

  const handleExpandClick = (id, item) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    // Prefill editRows for this id with current item values if not already set
    setEditRows((prev) => {
      if (prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          product_name: item.product_name,
          quantity: item.quantity,
          costprice: item.costprice,
          sellingprice: item.sellingprice
        }
      };
    });
  };

  const handleInputChange = (id, field, value) => {
    setEditRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async(id) => {
    // Here you can call a prop or API to save the changes
    // For now, just close the row and optionally update the table
    console.log({ id, editRows });
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                 },
                body: JSON.stringify({ id, ...editRows[id] }),
            });
            const data = await res.json();
    setOpenRows((prev) => ({ ...prev, [id]: false }));
    // Optionally: update stockList in parent via a callback
    if (res.ok) {
      props.refreshStockList(); // call parent to refresh the list
    }
  };

  const handleDelete = async(id) => {
    if(window.confirm("Are you sure you want to Delete?")){
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/delete`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
      });
      if (res.ok) {
        props.refreshStockList(); // call parent to refresh the list
      }
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Product Name</TableCell>
            <TableCell align="right">Quantity (KG)</TableCell>
            <TableCell align="right">Cost Price (₹)</TableCell>
            <TableCell align="right">Selling Price (₹)</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {stockList.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => handleExpandClick(item.id, item)}
                  >
                    {openRows[item.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                  {item.product_name}
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{item.costprice}</TableCell>
                <TableCell align="right">{item.sellingprice}</TableCell>
                <TableCell>
                  <DeleteForeverIcon fontSize='small' onClick={() => handleDelete(item.id)}>
                  
      
                  </DeleteForeverIcon>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                  <Collapse in={openRows[item.id]} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      <Typography variant="h6" gutterBottom component="div">
                        Edit Item
                      </Typography>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSave(item.id);
                        }}
                      >
                        <div className='edit-form' style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Product Name"
                            value={editRows[item.id]?.product_name || ''}
                            onChange={(e) => handleInputChange(item.id, 'product_name', e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={editRows[item.id]?.quantity || ''}
                            onChange={(e) => handleInputChange(item.id, 'quantity', e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Cost Price"
                            value={editRows[item.id]?.costprice || ''}
                            onChange={(e) => handleInputChange(item.id, 'costprice', e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Selling Price"
                            value={editRows[item.id]?.sellingprice || ''}
                            onChange={(e) => handleInputChange(item.id, 'sellingprice', e.target.value)}
                          />
                          <button type="submit">Save</button>
                        </div>
                      </form>
                    </Box>
                  </Collapse>
                </TableCell>
                
              </TableRow>
              

              
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
    // return <table className="stock-table">
    //           <thead>
    //             <tr>
    //               <th>Product Name</th>
    //               <th>Quantity</th>
    //               <th>Cost Price</th>
    //               <th>Selling Price</th>
    //             </tr>
    //           </thead>
    //                   <tbody>
    //             {stockList.map(item => (
    //               <tr key={item.id}>
    //                 <td>{item.product_name}</td>
    //                 <td>{item.quantity}</td>
    //                 <td>{item.costprice}</td>
    //                 <td>{item.sellingprice}</td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
}
export default CustomTable;