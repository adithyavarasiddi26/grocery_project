import React,{useState,useEffect} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import CustomerCount from './CustomerCount';
import BillsGenerated from './BillsGenerated';
import SaleTrends from './SaleTrends';
import TotalSale from './TotalSale';
import LowStockItems from './LowStockItems';
import './Analysis.css';
import TopSelling from './TopSelling';
import InventryValue from './InventryValue';


function Analysis() {
  return (
    <div className="analysis-container minimal-layout">
      <div className="first-row">
        <Card sx={{background:"#354F52", borderRadius: "50px"}} className="card customer-count">
          <CardContent>
            <CustomerCount />
          </CardContent>
        </Card>
        <Card sx={{background:"#354F52", borderRadius: "50px"}} className="card inventry-value">
          <CardContent sx={{margin:'20px'}}>
            <InventryValue />
          </CardContent>
        </Card>
        <Card sx={{background:"#354F52", borderRadius: "50px"}} className="card total-sales">
          <CardContent sx={{margin:'20px'}}>
            <TotalSale />
          </CardContent>
        </Card>
      </div>
      <div className='second-row'>
        <Card sx={{background:"#354F52",margin:0, borderRadius: "50px"}} className="card-parent sales-trends">
          <CardContent sx={{margin:'20px'}}>
            <SaleTrends />
          </CardContent>
        </Card>
        <Card sx={{background:"#354F52",margin:0, borderRadius: "50px"}} className="card bills-generated">
          <CardContent sx={{margin:'20px'}}>
            <BillsGenerated />
          </CardContent>
        </Card>
        </div>
      <div className='third-row'>
        <Card sx={{background:"#354F52", borderRadius: "50px"}} className="card top-selling">
          <CardContent sx={{margin:'20px'}}>
            <TopSelling />
          </CardContent>
        </Card>

        <Card sx={{background:"#354F52", borderRadius: "50px"}} className="card-parent lowStock">
          <CardContent sx={{margin:'20px'}}>
            <LowStockItems />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default Analysis;