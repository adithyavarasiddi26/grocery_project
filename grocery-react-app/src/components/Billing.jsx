import React,{useState,useEffect} from 'react';
// import DisplayStock from './DisplayStock';
// import DisplayBills from './DisplayBills';
import './Billing.css';
// import './DisplayStock.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from '@mui/material/Card';
import { useNavigate } from 'react-router-dom';
import generatePDF from './generatePDF';

function Billing() {
  const [shopDetails, setShopDetails] = useState({});
  const [billId, setBillId] = useState(null);
  const navigate = useNavigate();
    const fetchShopDetails = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/user/shopdetails', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log(data);
      if (data) setShopDetails(data);
    };
    useEffect(() => {
    fetchShopDetails();
  }, []);
  const [stockList, setStockList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [cashChange, setCashChange] = useState(0);

  const [itemList, setItemList] = useState({});
  const [selectedQty, setSelectedQty] = useState('');
  const [billingList, setBillingList] = useState([]);
  const today = new Date().toLocaleDateString();
  const [phone , setPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

      const fetchStockList = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/bill/stock', {
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
              const existingitem = billingList.find(billItem => billItem.id === itemList.id);
              if (existingitem) {
                  // If item already in billing list, update quantity
                  setBillingList(prev => prev.map(billItem =>
                      billItem.id === itemList.id
                          ? { ...billItem, selectedQty: billItem.selectedQty + Number(selectedQty) }
                          : billItem
                  ));
              } else {
                  setBillingList(prev => [
                      ...prev,
                      { ...itemList, selectedQty: Number(selectedQty) }
                  ]);
              }
              setStockList(prevList => prevList.map(item =>
                  item.id === itemList.id
                      ? { ...item, quantity: item.quantity - Number(selectedQty) }
                      : item
              ));
              setIsOpen(false);
              setSearchTerm('');
          }

          useEffect(() => {
            // Fetch billing data if needed
            console.log("Billing List Updated: ", billingList);
          }, [billingList]);

         async function generatePDF(billnum) {
            alert("Generating PDF...");
            const result = await fetch('http://localhost:5000/generate-pdf', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                billId: billnum.billnum,
                customerPhone: phone,
                paymentMode: paymentMode
               })
            });
            const blob = await result.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            if (blob) {
              a.href = url;
              a.download = `bill_${billnum.billnum}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              alert("PDF generated successfully!");
            } else {
              alert("Failed to generate PDF.");
            }
            setBillingList([]); // Clear billing list after generating bill
            setBillId(null); 
            fetchStockList(); // Refresh stock list to reflect changes
          }

          async function handleGenerateBill(){
            
            if(phone.trim() === '' || phone.length !== 10) {
              alert("Please enter a valid 10-digit customer's phone number.");
              return;
            }
            const token =localStorage.getItem('token');
            const filteredData= billingList.map(({product_name,selectedQty})=>({product_name,selectedQty}));
            console.log("Filtered Data: ", filteredData);
            try {
            const response = await fetch('http://localhost:5000/generate-bill', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                customerPhone: phone,
                items: filteredData,
                paymentMode: paymentMode
              })
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("Bill Generated: ", data.billId);
            setBillId(data.billId);
            generatePDF({
              billnum: data.billId,
            });
            setPhone('');
          } catch (error) {
            console.error("Error generating bill: ", error);
            alert("Failed to generate bill. Please try again.");
            return;
            }
            
            
          }
          useEffect(() => {
            console.log("bill",billId);
          }, [billId]);

          const handleCashReceivedChange = (e) => {
            const cashReceived = Number(e.target.value);
            const totalAmount = billingList.reduce((acc, item) => acc + item.sellingprice * item.selectedQty, 0);
            setCashChange(cashReceived - totalAmount);
          }

  return (
    <div className='billingContainer'>
      <div className='displayBilling'>
        <div className='billPageHeader'>
          <h2 style={{fontWeight:'bold',fontSize:'30px'}}>Available Stock</h2>
          <button className='btn' onClick={() => navigate('/billing/viewbills')}>view bills</button>
        </div>
        <div>
          <input className='billPageHeaderInput'
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className='CardContainer'>
            {(searchTerm.trim() ? stockList.filter(item =>
              item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
            ) : stockList)
              .map(item => (

                <div key={item.id}  className={item.quantity === '0' ? 'Card out-of-stock' : 'Card'} onClick={() => handleCardClick(item)}>
                  <h2 style={{fontWeight:'bold'}}>{item.product_name}</h2>
                  <p>Available (kgs): {item.quantity}</p>
                  <p>Price: Rs.{item.sellingprice}/kg</p>
                </div>

              ))}
          </div>
          {isOpen && (
            <div className='floatingContainer' onClick={() => setIsOpen(false)}>
              <div className='floatingCard' onClick={e => e.stopPropagation()}>
                <button className='closeButtonx' onClick={() => setIsOpen(false)}>×</button>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{itemList.product_name}</h2>
                <p>Available (kgs): <span style={{fontWeight: 'bold'}}>{itemList.quantity}</span></p>
                <input 
                  onWheel={(e) => e.target.blur()}
                  type="number"
                  min="1"
                  max={itemList.quantity}
                  value={selectedQty}
                  onChange={e => setSelectedQty(e.target.value)}
                  placeholder="Enter quantity"
                />
                <button className='btn' onClick={handleAddToBilling}>Add to Billing</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Card style={{ position: 'sticky', top: 0, backgroundColor: '#CAD2C5', borderRadius: '8px', padding: '16px', height: 'fit-content' }}>
        <div className='billingSummary'>
          <div className='billingHeader'>
          <h2 style={{fontWeight:'bold'}}>{shopDetails.shop_name}</h2>
          <h5>{shopDetails.address}</h5>
          <h5>{shopDetails.phone}</h5>
          </div>
          <h4 style={{fontWeight:'bold'}}>Billing Summary</h4>
          <h6>{today}</h6>
          {billingList.length > 0 && (
            <div className='billingList' style={{ width: '100%' }}>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table" className='billTable' style={{ borderCollapse: 'collapse' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell ></TableCell>
                      <TableCell className='cell' >Item</TableCell>
                      <TableCell className='cell' align="right" >Qty (kgs)</TableCell>
                      <TableCell className='cell' align="right" >Rate (/kg)</TableCell>
                      <TableCell className='cell' align="right" style={{ paddingRight: '9px' }} >Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billingList.map((item, idx) => (
                      <TableRow
                        key={item.product_name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell style={{ padding: '0px' }}>
                          <IconButton aria-label="delete" size="small" style={{ paddingTop: '6px' }} onClick={() => {
                            setBillingList(prev => prev.filter((_, i) => i !== idx));
                            setStockList(prevList => prevList.map(stockItem =>
                              stockItem.id === item.id
                                ? { ...stockItem, quantity: stockItem.quantity + item.selectedQty }
                                : stockItem
                            ));
                          }}>
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row" style={{ paddingLeft: '4px' }}>
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
              <input type='text' placeholder='Customer Phone Number' onChange={e => setPhone(e.target.value)} style={{ width: '100%', marginTop: '10px', padding: '8px', boxSizing: 'border-box' }} />
              <p>Payment mode</p>
              <select style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} onChange={e => setPaymentMode(e.target.value)} value={paymentMode}>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
              {paymentMode === 'cash' && (
                <>
                  <input type='number' placeholder='Cash Received' onChange={handleCashReceivedChange} style={{ width: '100%', marginTop: '10px', padding: '8px', boxSizing: 'border-box' }} />
                  <div style={{ marginTop: '10px' }}>
                    <strong>Change to Return: </strong> {`₹${cashChange}`}
                  </div>
                </>
              )}
              <button className='btn' style={{ width: '100%', marginTop: '10px', padding: '8px', boxSizing: 'border-box' }} onClick={handleGenerateBill}>Generate Bill</button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

}


export default Billing;
