import React,{useState,useEffect} from 'react';
// import DisplayStock from './DisplayStock';
import './Billing.css';
import './DisplayStock.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

function Billing() {
  const [shopName, setShopName] = useState('');
    
    const fetchShopName = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/user/shopname', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log(data);
      if (data.shop_name) setShopName(data.shop_name);
    };
    useEffect(() => {
    fetchShopName();
  }, []);
  const [stockList, setStockList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [itemList, setItemList] = useState({});
  const [selectedQty, setSelectedQty] = useState('');
  const [billingList, setBillingList] = useState([]);
  const today = new Date().toLocaleDateString();

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

          function handleCardClick(item) {
              setIsOpen(true);
              setItemList(item);
              setSelectedQty(''); // reset input when opening
          }
  
          function handleAddToBilling() {
              if (!selectedQty || isNaN(selectedQty) || Number(selectedQty) <= 0) {
                  alert('Please enter a valid quantity.');
                  return;
              }
              if (Number(selectedQty) > Number(itemList.quantity)) {
                  alert('Selected quantity exceeds available stock.');
                  return;
              }
              setBillingList(prev => [
                  ...prev,
                  { ...itemList, selectedQty: Number(selectedQty) }
              ]);
              setStockList(prevList => prevList.map(item =>
                  item.id === itemList.id
                      ? { ...item, quantity: item.quantity - Number(selectedQty) }
                      : item
              ));
              setIsOpen(false);
          }

          useEffect(() => {
            // Fetch billing data if needed
            console.log("Billing List Updated: ", billingList);
          }, [billingList]);

  return (
    <div className='billingContainer'>
      <div className='displayBilling'>
        <h2>Available Stock</h2>
        <div>
            {/* <h2>Display Stock Component</h2> */}
            <div className='CardContainer'>
                {stockList.map(item => (
                    <div key={item.id} className='Card' onClick={() => handleCardClick(item)}>
                        <h2>{item.product_name}</h2>
                        <p>Available (kgs): {item.quantity}</p>
                        <p>Price: Rs.{item.sellingprice}/kg</p>
                    </div>
                ))}
            </div>
            {isOpen&&<div className='floatingContainer' onClick={() => setIsOpen(false)}>
                <div className='floatingCard' onClick={(e) => e.stopPropagation()}>
                    <h3>{itemList.product_name}</h3>
                    <p>Available (kgs): {itemList.quantity}</p>
                    <input
                            type="number"
                            min="1"
                            max={itemList.quantity}
                            value={selectedQty}
                            onChange={e => setSelectedQty(e.target.value)}
                            placeholder="Enter quantity"
                        />
                        <button onClick={handleAddToBilling}>Add to Billing</button>
                </div>
            </div>}


            {/* Example: Display billing list */}
           
        </div>
      </div>
      <div className='billingSummary'>
        <h2>{shopName}</h2>
        <h4>Billing Summary</h4>
        <h6>{today}</h6>

         {billingList.length > 0 && (
          <div className='billingList' style={{width:'100%'}}>
          <TableContainer component={Paper}>
      <Table  size="small" aria-label="a dense table" className='billTable' style={{borderCollapse: 'collapse'}}>
        <TableHead>
          <TableRow>
            <TableCell ></TableCell>
            <TableCell className='cell' >Item</TableCell>
            <TableCell className='cell' align="right" >Qty (kgs)</TableCell>
            <TableCell className='cell' align="right" >Rate (/kg)</TableCell>
            <TableCell className='cell' align="right" style={{paddingRight:'9px'}} >Amount (₹)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {billingList.map((item,idx)=>(
            <TableRow
              key={item.product_name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <IconButton aria-label="delete" size="small" style={{paddingTop: '6px'}} onClick={() => {
                    setBillingList(prev => prev.filter((_, i) => i !== idx));
                    setStockList(prevList => prevList.map(stockItem =>
                      stockItem.id === item.id
                        ? { ...stockItem, quantity: stockItem.quantity + item.selectedQty }
                        : stockItem
                    ));
                }}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
              {/* <button onClick={() => {
                    setBillingList(prev => prev.filter((_, i) => i !== idx));
                }}>X</button> */}
              <TableCell component="th" scope="row" style={{paddingLeft:'4px'}}>
                {item.product_name}
              </TableCell>
              <TableCell align="right">{item.selectedQty}</TableCell>
              <TableCell align="right">{item.sellingprice}</TableCell>
              <TableCell align="right">{item.sellingprice * item.selectedQty}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} align="right">Total:</TableCell>
            <TableCell align="right">
              {billingList.reduce((acc, item) => acc + item.sellingprice * item.selectedQty, 0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
    </div>
                // <div className="billingList">
                //     <table>
                //         <thead>
                //             <tr>
                //                 <th>Product</th>
                //                 <th>Quantity (kgs)</th>
                //                 <th>Price</th>
                //             </tr>
                //         </thead>
                //         <tbody>
                //             {billingList.map((item, idx) => (
                //                 <tr key={idx}>
                //                     <td>{item.product_name}</td>
                //                     <td>{item.selectedQty}</td>
                //                     <td>Rs.{item.sellingprice * item.selectedQty}</td>
                //                 </tr>
                //             ))}
                //         </tbody>
                //     </table>
                // </div>
            )}
      </div>
    </div>
  );
}


export default Billing;
