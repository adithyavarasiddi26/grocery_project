import React from "react";

const generatePDF = ({ billId, billingList, shopName, phone, paymentMode }) => {
  // Function to generate PDF (placeholder)
  const createPDF = () => {
    // PDF generation logic goes here
  };
  return (
    <div>
        {console.log('inside pdf')}
      {alert(`Generating PDF for Bill ID: ${billId}, Shop: ${shopName}, Phone: ${phone}, Payment Mode: ${paymentMode}`)}
    </div>
  );
};

export default generatePDF;
