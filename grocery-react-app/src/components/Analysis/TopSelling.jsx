import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';
import { BarChart } from '@mui/x-charts/BarChart';

const TopSelling = () => {
  const [topSellingQuantity, setTopSellingQuantity] = useState([]);
  const [topSellingRevenue, setTopSellingRevenue] = useState([]);
  const [topSellingProfit, setTopSellingProfit] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [toggleName, setToggleName] = useState('Quantity Sold');

  const fetchTopSellingItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/top-selling-items`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        // Defensive: filter out null/undefined and ensure numbers
        setTopSellingQuantity(
          (data.byQuantity || []).filter(item => item && item.product_name != null)
            .map(item => ({
              ...item,
              quantity_sold: Number(item.quantity_sold) || 0
            }))
        );
        setTopSellingRevenue(
          (data.byRevenue || []).filter(item => item && item.product_name != null)
            .map(item => ({
              ...item,
              total_revenue: Number(item.total_revenue) || 0
            }))
        );
        setTopSellingProfit(
          (data.byProfit || []).filter(item => item && item.product_name != null)
            .map(item => ({
              ...item,
              total_profit: Number(item.total_profit) || 0
            }))
        );
      } catch (error) {
        console.error('Error fetching top selling items:', error);
      }
    };

    useEffect(() => {
      fetchTopSellingItems();
    }, []);

    const chartSetting = {
      xAxis: [
        {
          label: 'By ' + toggleName,
        },
      ],
      height: 400,
      margin: { left: 0 },
    };

    const handleChange = (event) => {
      const newToggle = event.target.value;
      if (newToggle !== null) {
        setToggleName(newToggle);
      }
    };

    useEffect(() => {
      let items = [];
      if (toggleName === 'Quantity Sold') {
        items = topSellingQuantity;
      } else if (toggleName === 'Revenue') {
        items = topSellingRevenue;
      } else {
        items = topSellingProfit;
      }
      setTopSellingItems(items);
    }, [toggleName, topSellingQuantity, topSellingRevenue, topSellingProfit]);

    // Defensive: always provide fallback arrays and check for nulls
    const yLabels = Array.isArray(topSellingItems) ? topSellingItems.map(item => item.product_name || '') : [];
    const seriesData = Array.isArray(topSellingItems)
      ? topSellingItems.map(item =>
          toggleName === 'Quantity Sold'
            ? (item.quantity_sold ?? 0)
            : toggleName === 'Revenue'
            ? (item.total_revenue ?? 0)
            : (item.total_profit ?? 0)
        )
      : [];

    return (
      <div>
        <div className='container-cc'>
          <div className='total-sale-container'>
        <h3 style={{fontSize:'2rem'}}>Top Sellers by {toggleName}</h3>
        <select name="by" id="toggleBy" value={toggleName} onChange={handleChange}>
          <option value="Quantity Sold">Quantity Sold</option>
          <option value="Revenue">Revenue</option>
          <option value="Profit">Profit</option>
        </select>
        </div>
        <div style={{width:'100%'}} className='total-sale-container'>
        <BarChart sx={{width:'100%'}}
          dataset={topSellingItems}
          yAxis={[
            {
              label: 'Products',
              data: yLabels.length > 0 ? yLabels : ['No Data'],
            },
          ]}
          series={[
            {
              label: toggleName,
              data: seriesData.length > 0 ? seriesData : [0],
              area: true,
              color: '#22223b',
            },
          ]}
          layout="horizontal"
          {...chartSetting}
        />
        </div>
        </div>
      </div>
    );
  };
export default TopSelling;