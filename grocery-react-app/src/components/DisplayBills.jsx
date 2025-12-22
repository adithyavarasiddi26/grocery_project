import React,{useEffect, useState} from "react";
import './DisplayBills.css';
// import './DisplayStock.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tab from "@mui/material/Tab";
import { useNavigate } from "react-router-dom";


function DisplayBills() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
    const [bills, setBills] = useState([]);
    const [showBill,setShowBill] = useState(false);
    const [billItems,setBillItems] = useState({});
    const [billDetails, setBillDetails] = useState({
      Phone : '',
      Amount : '',
      payment_mode: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const fetchBills = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/bills', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (Array.isArray(data)) setBills(data);
    };
    useEffect(() => {
        fetchBills();
    }, []);


    // Compute filtered bills for display
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.bill_date);
      const billDateStr = billDate.toISOString().slice(0, 10); // 'YYYY-MM-DD'
      const from = fromDate ? fromDate : null;
      const to = toDate ? toDate : null;
      const matchesDate =
        (!from || billDateStr >= from) &&
        (!to || billDateStr <= to);
      const matchesSearch = !searchTerm.trim() || (bill.customer_phone && bill.customer_phone.includes(searchTerm));
      return matchesDate && matchesSearch;
    });

  const viewBill = async (billId, customerPhone, totalAmount, paymentMode) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/bills/${billId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: 'GET'
    });
    const data = await res.json();
    setBillItems(data);
    setShowBill(true);
    setBillDetails({
      Phone : customerPhone,
      Amount : totalAmount,
      payment_mode : paymentMode
    });
    console.log(data);
  }

  async function downloadPDF(billnum, billDetails) {
                alert("Generating PDF...");
            const result = await fetch('http://localhost:5000/generate-pdf', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                billId: billnum,
                customerPhone: billDetails.Phone,
                paymentMode: billDetails.payment_mode
               })
            });
            const blob = await result.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            if (blob) {
              a.href = url;
              a.download = `bill_${billnum}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              alert("PDF generated successfully!");
            } else {
              alert("Failed to generate PDF.");
            }
          };
    // useEffect(() => {
    //   console.log(filteredBills);
    // }, [filteredBills]);
  return <div>
    <button className="closeButton back" onClick={() => navigate('/billing')}>Back</button>
    <h1>Bills</h1>
    <div className="searchContainer" >
      <input
        type="text"
        placeholder="Search by phone..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginRight: '8px', padding: '6px', width: '30%' }}
      />
      <div className="dateContainer">
      
        <a>from</a>
      <input
        type="date"
        value={fromDate}
        onChange={e => setFromDate(e.target.value)}
        
      />
      <a>to</a>
      <input
        type="date"
        value={toDate}
        onChange={e => setToDate(e.target.value)}
        
      />
      </div>
    </div>
    <div className="billList">
      {filteredBills.length === 0 ? (
        <p>No bills available</p>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Bill id</TableCell>
                <TableCell align="right">Customer Phone</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow
                  key={bill.bill_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {bill.bill_id}
                  </TableCell>
                  <TableCell align="right">{bill.customer_phone}</TableCell>
                  <TableCell align="right">{bill.total_amount}</TableCell>
                  <TableCell align="right">{new Date(bill.bill_date).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell align="right"><button className="btn" onClick={() => viewBill(bill.bill_id,bill.customer_phone,bill.total_amount,bill.payment_mode)}>View</button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
    {showBill && (
      <div className="ItemContainer" onClick={() => setShowBill(false)}>
        <div className="Item">
          <button className="closebtn" onClick={() => setShowBill(false)}>x</button>
          <h1>Bill No: {billItems[0]?.bill_id}</h1>
          <h4>Customer Phone: {billDetails.Phone}</h4>
          <h5>Payment Mode: {billDetails.payment_mode}</h5>
          <TableContainer component={Paper} className="billTable">
            <Table aria-label="simple table">
              <TableHead>
                <TableRow style={{backgroundColor:'#a9b0a5ff'}}>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Qty (kgs)</TableCell>
                  <TableCell align="right">Rate (/kg)</TableCell>
                  <TableCell align="right">Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(billItems) && billItems.length > 0 ? (
                  <>
                    {billItems.map((item, idx) => (
                      <TableRow key={item.bill_item_id || idx}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price}</TableCell>
                        <TableCell align="right">{
                          isNaN(Number(item.quantity)) || isNaN(Number(item.price))
                            ? "0.00"
                            : (Number(item.quantity) * Number(item.price)).toFixed(2)
                        }</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>₹ {billDetails.Amount}</strong></TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No items in this bill</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <button className="btn" onClick={() => downloadPDF(billItems[0]?.bill_id,billDetails)}>Download PDF</button>
        </div>
      </div>
    )}
    </div>;
}

export default DisplayBills;