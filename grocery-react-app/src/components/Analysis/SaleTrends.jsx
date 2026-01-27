import React,{useState,useEffect} from 'react';
import API_BASE_URL from '../../config/api';
import { LineChart } from '@mui/x-charts/LineChart';
import './SaleTrends.css';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const SaleTrends = () => {
    const [salesTrendsData, setSalesTrendsData] = useState({monthNumber: [], totalSales: [], totalProfit: []});
    const [radioValue, setRadioValue] = useState('Sale');
const salesTrends = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analysis/salesTrends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }, method: 'GET'
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      console.log('Sales Trends Data:', data);
      setSalesTrendsData(data);
    } catch (error) {
      console.error('Error fetching sales trends:', error);
    }
  }
  useEffect(() => {
    salesTrends();
  }, []);

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
  };
  return (
    <div>
      <div className='container-cc'>
      <div className='total-sale-container'>
<h3 style={{ fontSize:'2rem'}}>{radioValue} Trends</h3>
          <RadioGroup row value={radioValue} onChange={handleRadioChange}>
            <FormControlLabel value="Sale" control={<Radio />} label="Sales" />
            <FormControlLabel value="Profit" control={<Radio />} label="Profit" />
          </RadioGroup>
          </div>
          <div className='total-sale-container linechart'>
          <LineChart 
            sx={{width:'100%'}}
            xAxis={[{
              label: 'Months',
              data: salesTrendsData.monthNumber ,
              scaleType: 'point',
              valueFormatter: (value) => {
                const months = [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return months[value] || `Month ${value}`;
              }
            }]}
            yAxis={[{
              tickMinStep: 1,
              tickLabelFormatter: (value) => {
                if (value == null) return '';
                if (value >= 10000000) return (value / 10000000).toFixed(2) + ' Cr';
                if (value >= 100000) return (value / 100000).toFixed(2) + ' L';
                if (value >= 1000) return (value / 1000).toFixed(2) + ' K';
                return value.toLocaleString('en-IN');
              }
            }]}
            series={[
              {
                label: radioValue,
                data: radioValue === 'Sale' ? salesTrendsData.totalSales : salesTrendsData.totalProfit,
                area: true,
                color: '#2F3E46',
              },
            ]}
            height={300}
            
          />
          </div>
          </div>
    </div>
  );
}

export default SaleTrends;
