import React,{useState,useEffect} from "react";
import API_BASE_URL from '../../config/api';
import { LineChart } from '@mui/x-charts/LineChart';

const BillsGenerated = () => {
    const [billsGenerated, setBillsGenerated] = useState({monthName: [], monthNumber: [], billsGenerated: [],totalBills:0});

    const fetchBillsGenerated = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analysis/billsGenerated`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }, method: 'GET'
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setBillsGenerated({...data,totalBills:data.billsGenerated.reduce((acc, curr) => acc + Number(curr), 0)});
      // setBillsGenerated(data.count || 0);
    } catch (error) {
      console.error('Error fetching bills generated:', error);
      setBillsGenerated({monthName: [], monthNumber: [], billsGenerated: [],totalBills:0});
    }
  }
  useEffect(() => {
    fetchBillsGenerated();
  }, []);
  return <div>
    <div className="container-cc">
      <div className="total-sale-container">
    <h3 style={{ fontSize:'2rem'}}>Bills generated</h3>
    <h3 style={{fontWeight:'bold', fontSize:'3rem'}}>{billsGenerated.totalBills}</h3>
    </div>
    <div style={{width:'100%'}} className="inventry-value-container">
              <LineChart sx={{width:'100%'}}
                xAxis={[{
                  label: 'Months',
                  data: billsGenerated.monthNumber || [1, 2, 3, 4, 5, 6, 7],
                  scaleType: 'point',
                  valueFormatter: (value) => {
                    const months = [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return months[value] || `Month ${value}`;
                  }
                }]}
                series={[
                  {
                    label: 'Bills Generated',
                    data: billsGenerated.billsGenerated || [2, 3, 5, 7, 11, 13, 17],
                    area: true,
                    color: '#2F3E46',
                  },
                ]}
                height={300}
                
              />
              </div>
              </div>
  </div>;
};
export default BillsGenerated;