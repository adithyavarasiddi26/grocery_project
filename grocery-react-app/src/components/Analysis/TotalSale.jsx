import React,{useState,useEffect} from 'react';
import API_BASE_URL from '../../config/api';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import './TotalSale.css';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const TotalSale = () => {
    const [toggle,setToggle] = useState('sale');
    const [time,setTime] = useState('today');
    const [totalSale,setTotalSale] = useState(0);

    const handleToggleChange = (event, newAlignment) => {
    setToggle(newAlignment);
  };
    const fetchTotalSale = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analysis?type=${toggle}&time=${time}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }, method: 'GET'
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setTotalSale(data.sum || 0);
    } catch (error) {
      console.error('Error fetching total sale:', error);
      setTotalSale(0);
    }
  }

  useEffect(() => {
    fetchTotalSale();
  }, [toggle, time]);
    
    return <div>
      <div className='container-cc'>
<div className='total-sale-container'>
        {toggle === 'sale' && <h2>Sales</h2>}
        {toggle === 'profit' && <h2>Profit</h2>}
      <ToggleButtonGroup
      value={toggle}
      exclusive
      onChange={handleToggleChange}
      aria-label="Platform"
    >
      <ToggleButton value="sale">Sale</ToggleButton>
      <ToggleButton value="profit">Profit</ToggleButton>
    </ToggleButtonGroup>

          <FormControl sx={{ m: 1, minWidth: 120, background:'#CAD2C5', borderRadius:'8px' }} size="small">
          <Select 
            inputProps={{
             MenuProps: {
            MenuListProps: {
                sx: {
                    backgroundColor: '#CAD2C5',
                }
            }  }
            }}

            labelId="sort-by-label"
            id="sort-by-select"
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <MenuItem  value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
         </FormControl>

    {/* <select onChange={(e) => setTime(e.target.value)} value={time} style={{marginLeft:'20px',padding:'6px'}}>
      <option value={"today"}>Today</option>
      <option value={"week"}>This Week</option>
      <option value={"month"}>This Month</option>
      <option value={"year"}>This Year</option>
    </select> */}

    </div>
    <div className='total-sale-container value'>
      <h4>{time}'s total {toggle}</h4>
      <h1>{totalSale}</h1>
    </div>
    </div>
    </div>;
}

export default TotalSale;