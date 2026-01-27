import express, { json } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import fs from "fs";
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: 'postgres', // change to your postgres user
  host: 'localhost',
  database: 'grocerydb', // change to your database name
  password: 'postgres', // change to your postgres password
  port: 5432,
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password, phone, shop_name ,name, shop_address } = req.body;
  if (!email || !password || !phone || !shop_name || !name || !shop_address) return res.status(400).json({ error: 'All fields are required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (email, password, phone, shop_name, name, address) VALUES ($1, $2, $3, $4, $5, $6)', [email, hashed, phone, shop_name, name, shop_address]);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret');
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Reset password endpoint
app.post('/reset-password', authenticate, async (req, res) => {
  const { newPassword } = req.body;
  const user_id = req.user.id;
  
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/stock', authenticate, async (req, res) => {
    console.log("inside backend");
  const { product_name, quantity, costprice, sellingprice } = req.body;
  const user_id = req.user.id; // Extracted from JWT
  console.log("user id:", user_id);
  if (!product_name || quantity == null || costprice == null || sellingprice == null)
    return res.status(400).json({ error: 'All fields required' });
  try {
    await pool.query("BEGIN");
    await pool.query(
      'INSERT INTO stock (user_id, product_name, quantity, costprice, sellingprice, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [user_id, product_name, quantity, costprice, sellingprice]
    );
    await pool.query('UPDATE stock SET sellingprice = $1 WHERE user_id = $2 AND product_name = $3', [sellingprice, user_id, product_name]);
    await pool.query("COMMIT");
    res.status(201).json({ message: 'Stock added' });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/bill/stock', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT MIN(id) AS id,product_name,SUM(quantity) AS quantity,MAX(sellingprice) AS sellingprice FROM stock WHERE user_id = $1 GROUP BY product_name',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/stock', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM stock WHERE user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

//get stock by sorting order
app.post('/getstock', authenticate, async (req, res) => {
  const user_id = req.user.id;
  const { sortBy , order } = req.body;
  
    if(sortBy==='recent'){
      try{
    const result = await pool.query(
      `SELECT * FROM stock WHERE user_id = $1 ORDER BY created_at ${order}`,
      [user_id]
    );
    res.json(result.rows);
  }catch(err){
    res.status(500).json({ error: 'Database error' });
  }
}
  else{
    try{
    const result = await pool.query(
      `SELECT * FROM stock WHERE user_id = $1 ORDER BY ${sortBy} ${order}`,
      [user_id]
    );
  
  res.json(result.rows);
} catch (err) {
    res.status(500).json({ error: 'Database error' });
  }}
});

//out of stock items
app.get('/stock/outofstock', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM stock WHERE user_id = $1 AND quantity = 0',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/update', authenticate, async (req, res) => {
  console.log("inside update server");
  console.log(req.body);
  const { id, ...data } = req.body;
  const user_id = req.user.id;
  console.log(user_id);

    try {
      await pool.query(
        'UPDATE stock SET product_name = $1, quantity = $2, costprice = $3, sellingprice = $4 WHERE id = $5 AND user_id = $6',
        [data.product_name, data.quantity, data.costprice, data.sellingprice, id, user_id]
      );
      res.json({ message: 'Stock updated' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
})

app.post('/delete', authenticate, async (req, res) => {
  const { id } = req.body;
  const user_id = req.user.id;
  console.log(id,user_id);

  try {
    await pool.query(
      'DELETE FROM stock WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

//Shop details to display in bill
app.get('/user/shopdetails', authenticate, async (req, res) => {
    console.log("inside shop details");
  const user_id = req.user.id;
    console.log(user_id);
  try {
    const result = await pool.query('SELECT shop_name, address, phone FROM users WHERE id = $1', [user_id]);
    if (result.rows.length > 0) {
      res.json({ shop_name: result.rows[0].shop_name, address: result.rows[0].address, phone: result.rows[0].phone });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });

  }
});

// Billing generation button click
app.post('/generate-bill', authenticate, async (req, res) => {
    // Logic to generate bill
    const user_id = req.user.id;
    const { customerPhone, items, paymentMode } = req.body;
    console.log("items:", JSON.stringify(items));
    try {
      await pool.query("BEGIN");
      const result = await pool.query('SELECT generate_bill_fifo($1, $2, $3, $4)', [user_id,customerPhone,paymentMode,JSON.stringify(items)] );
      // update bills table
    //   const result = await pool.query(
    //     'INSERT INTO bills (user_id, customer_phone, total_amount, total_profit,bill_date,payment_mode) VALUES ($1, $2, $3, $4, $5, $6) RETURNING bill_id',
    //     [user_id, customerPhone, totalAmount, totalProfit, billDate,paymentMode]
    //   );
      const billId = result.rows[0].generate_bill_fifo;
    //   console.log(billId);
    //   // update bill_items table
    //   for (const item of items) {
    //     await pool.query('INSERT INTO bill_items (user_id,bill_id, product_name, quantity, price, profit) VALUES ($1, $2, $3, $4, $5, $6)',
    //       [user_id, billId, item.product_name, item.selectedQty, Number(item.sellingprice), (Number(item.sellingprice) - Number(item.costprice))* Number(item.selectedQty)]);
    //   }
    // //   // Deduct stock quantities
    //   for (const item of items) {
    //     await pool.query('UPDATE stock SET quantity = quantity - $1 WHERE user_id = $2 AND product_name = $3',
    //       [item.selectedQty, user_id, item.product_name]);
    //   }
      await pool.query("COMMIT");
      console.log("Bill generated with ID:", billId);
      res.json({ message: 'Bill generated', billId });
    } catch (err) {
      await pool.query("ROLLBACK");
      console.log(err);
      res.status(500).json({ error: 'Database error' });
    }

});

//fetch bills
app.get('/bills', authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query('SELECT * FROM bills WHERE user_id = $1 ORDER BY bill_date DESC', [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// fetch bill items
app.get('/bills/:id', authenticate, async (req, res) => {
    const user_id = req.user.id;
    const bill_id = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM bill_items WHERE user_id = $1 AND bill_id = $2', [user_id, bill_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});


// analysis route
// fetch total sales data
app.get('/analysis', authenticate, async (req, res) => {
    const user_id = req.user.id;
    const { type, time } = req.query;
    console.log("Type:", type, "Time:", time);
    try{
        let result;
        if(type === 'sale'){
            switch(time){
                case 'today':
                    result = await pool.query('SELECT SUM(total_amount) FROM bills WHERE user_id = $1 AND bill_date = CURRENT_DATE', [user_id]);
                    break;
                case 'week':
                    result = await pool.query('SELECT SUM(total_amount) FROM bills WHERE user_id = $1 AND to_char(bill_date, \'IW\') = to_char(CURRENT_DATE, \'IW\') AND to_char(bill_date, \'YYYY\') = to_char(CURRENT_DATE, \'YYYY\')', [user_id]);
                    break;
                case 'month':
                    result = await pool.query('SELECT SUM(total_amount) FROM bills WHERE user_id = $1 AND to_char(bill_date::date, \'IYYY-MM\') = to_char(CURRENT_DATE, \'IYYY-MM\')', [user_id]);
                    break;
                case 'year':
                    result = await pool.query('SELECT SUM(total_amount) FROM bills WHERE user_id = $1 AND to_char(bill_date, \'YYYY\') = to_char(CURRENT_DATE, \'YYYY\')', [user_id]);
                    break;
            }
        } else if (type === 'profit') {
            switch(time){
                case 'today':
                    result = await pool.query('SELECT SUM(total_profit) FROM bills WHERE user_id = $1 AND bill_date = CURRENT_DATE', [user_id]);
                    break;
                case 'week':
                    result = await pool.query('SELECT SUM(total_profit) FROM bills WHERE user_id = $1 AND to_char(bill_date, \'IW\') = to_char(CURRENT_DATE, \'IW\') AND to_char(bill_date, \'YYYY\') = to_char(CURRENT_DATE, \'YYYY\')', [user_id]);
                    break;
                case 'month':
                    result = await pool.query('SELECT SUM(total_profit) FROM bills WHERE user_id = $1 AND to_char(bill_date::date, \'IYYY-MM\') = to_char(CURRENT_DATE, \'IYYY-MM\')', [user_id]);
                    break;
                case 'year':
                    result = await pool.query('SELECT SUM(total_profit) FROM bills WHERE user_id = $1 AND to_char(bill_date, \'YYYY\') = to_char(CURRENT_DATE, \'YYYY\')', [user_id]);
                    break;
            }
                // Add a default response if no case matches
                if (!result) {
                    return res.status(400).json({ error: 'Invalid type or time parameter' });
                }
                
            }
        console.log(result.rows[0]);
            res.json(result.rows[0]);
        } catch (err) {
            return res.status(500).json({ error: 'Database error' });
        }
    });

  // fetch total customers data 
  app.get('/analysis/customerCount', authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
      const result = await pool.query('SELECT COUNT(DISTINCT customer_phone) AS CUST_COUNT FROM bills WHERE user_id=$1 AND EXTRACT(YEAR FROM bill_date) = EXTRACT(YEAR FROM CURRENT_DATE);', [user_id]);
      res.json({ count: result.rows[0].cust_count });
    } catch (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // fetch total bills generated data"

  app.get('/analysis/billsGenerated', authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
      const result = await pool.query("WITH months AS ( SELECT date_trunc('month', d)::date AS month_start FROM generate_series( CURRENT_DATE - interval '5 months', CURRENT_DATE, interval '1 month' ) d ) SELECT to_char(m.month_start, 'Month') AS month_name, EXTRACT(MONTH FROM m.month_start) AS month_number, COUNT( b.bill_id) AS bills_generated FROM months m LEFT JOIN bills b ON date_trunc('month', b.bill_date) = m.month_start AND b.user_id=$1 GROUP BY m.month_start ORDER BY m.month_start;", [user_id]);
      // console.log(result.rows);
      res.json({
        monthName: result.rows.map(r => r.month_name.trim()),
        monthNumber: result.rows.map(r => r.month_number),
        billsGenerated: result.rows.map(r => r.bills_generated)
      });
      // res.json({ 
      //   count: result.rows[0].bills_generated
      // });
    } catch (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });

  // fetch sales trends
  app.get('/analysis/salesTrends', authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
      const result = await pool.query("WITH months AS ( SELECT date_trunc('month', d)::date AS month_start FROM generate_series( CURRENT_DATE - interval '5 months', CURRENT_DATE, interval '1 month' ) d ), filtered_bills AS ( SELECT * FROM bills WHERE user_id = $1 ) SELECT EXTRACT(MONTH FROM m.month_start) AS month_number, COALESCE(SUM(b.total_amount), 0) AS total_sales, COALESCE(SUM(b.total_profit), 0) AS total_profit FROM months m LEFT JOIN filtered_bills b ON date_trunc('month', b.bill_date) = m.month_start GROUP BY m.month_start ORDER BY m.month_start;", [user_id]);
      res.json({
        monthNumber: result.rows.map(r => r.month_number),
        totalSales: result.rows.map(r => r.total_sales),
        totalProfit: result.rows.map(r => r.total_profit)
      });
    } catch (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });

  //fetch low stock items
  app.post('/analysis/lowStockItems', authenticate, async (req, res) => {
    const user_id = req.user.id;
    console.log("body is ",req.body);
    const { threshold } = req.body;
    console.log("Threshold:", threshold);
    try {
      const result = await pool.query("SELECT product_name, quantity from stock WHERE user_id=$1 AND quantity < $2 ORDER BY quantity ASC;", [user_id, threshold]);
      res.json({ items: result.rows });
    } catch (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });

  //fetch top selling items
  app.get('/analysis/top-selling-items', authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
      await pool.query("BEGIN");
      // top sellers by quantity sold
      const result = await pool.query("SELECT bi.product_name, SUM(bi.quantity) AS quantity_sold FROM bill_items bi JOIN bills b ON bi.bill_id = b.bill_id WHERE b.user_id = $1 GROUP BY bi.product_name ORDER BY quantity_sold DESC LIMIT 10;", [user_id]);
      const byQuantity = result.rows;
      // top sellers by revenue
      const result2 = await pool.query("SELECT bi.product_name, SUM(bi.price * bi.quantity) AS total_revenue FROM bill_items bi JOIN bills b ON bi.bill_id = b.bill_id WHERE b.user_id = $1 GROUP BY bi.product_name ORDER BY total_revenue DESC LIMIT 10;", [user_id]);
      const byRevenue = result2.rows;
      // top sellers by profit
      const result3 = await pool.query("SELECT bi.product_name, SUM(bi.profit) AS total_profit FROM bill_items bi JOIN bills b ON bi.bill_id = b.bill_id WHERE b.user_id = $1 GROUP BY bi.product_name ORDER BY total_profit DESC LIMIT 10;", [user_id]);
      const byProfit = result3.rows;
      res.json({ byQuantity, byRevenue, byProfit });
      await pool.query("COMMIT");

    } catch (err) {
      await pool.query("ROLLBACK");
      res.status(500).json({ error: 'Database error' });
    }
  });

  //fetch inventry value
  app.get('/analysis/inventoryValue', authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
      const result = await pool.query("SELECT SUM(costprice * quantity) AS cost_price, SUM(sellingprice * quantity) AS selling_price FROM stock WHERE user_id = $1", [user_id]);
      res.json({ Value: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Database error' });
    }
  });




  // Generate PDF invoice function
async function generateInvoice(billingInfo, filePath) {
  const { items, billId, customerPhone, paymentMode, shop_name, user_number, shop_address } = billingInfo;
  console.log("Generating invoice with info:", items);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; font-size: 22px; font-weight: bold; }
          .subheader { text-align: center; font-size: 12px; }
          .address { text-align: center; font-size: 12px; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #16a085; color: white; }
          .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">${shop_name || 'My Grocery Store Pvt Ltd'}</div>
        <div class="subheader">User Number: ${user_number || ''}</div>
        <div class="address">${shop_address || ''}</div>
        <hr />
        <p>Bill No: ${billId} <br>
           Date: ${new Date(items[0]?.bill_date).toLocaleDateString()} <br>
           Customer Phone: ${customerPhone}
        </p>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price (₹)</th><th>Total (₹)</th></tr>
          </thead>
          <tbody>
            ${items.map(
              item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>${(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
                </tr>`
            ).join("")}
          </tbody>
        </table>
        <p class="total">Grand Total: ₹${items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0).toFixed(2)}</p>
        <div class="footer">Thank you for shopping with us!</div>
      </body>
    </html>
  `;

  await page.setContent(html);
  await page.pdf({ path: filePath, format: "A4" });

  await browser.close();
}
 
 


 
// API endpoint to generate invoice
app.post("/generate-pdf", authenticate, async (req, res) => {
  const {  billId, customerPhone, paymentMode } = req.body;
  const user_id = req.user.id;
  console.log("inside generate pdf", billId);
  // console.log("Billing Info:", billItems);

  // Fetch shop name and user number (phone) from DB
  try {
    const userResult = await pool.query('SELECT shop_name, phone, address FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const shop_name = userResult.rows[0].shop_name;
    const user_number = userResult.rows[0].phone;
    const shop_address = userResult.rows[0].address;
    let billItems;
    try {
      const billItemsResult = await pool.query('SELECT * FROM bill_items WHERE user_id = $1 AND bill_id = $2', [user_id, billId]);
      billItems = billItemsResult.rows;
      if (billItems.length === 0) {
        return res.status(404).json({ error: 'No items found for this bill' });
      }
    } catch (err) {
      console.log('Error fetching bill items:', err);
      return res.status(500).json({ error: 'Failed to fetch bill items' });
    }
    console.log("Bill Items:", billItems);

    const filePath = `C:\\Users\\10829016\\OneDrive - LTIMindtree\\Desktop\\invoice_${billId}.pdf`;
    await generateInvoice({ items: billItems, billId, customerPhone, paymentMode, shop_name, user_number, shop_address }, filePath);
    res.download(filePath); // Send file to client
  } catch (err) {
    console.log('error', err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

//profile details
app.get("/profile", authenticate, async (req, res) => {
  const user_id = req.user.id;

  try {
    const userResult = await pool.query('SELECT email, phone, shop_name, name, address FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("User Profile:", userResult.rows[0]);
    res.json(userResult.rows[0]);
  } catch (err) {
    console.log('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

//put profile info "save"
app.put("/profile", authenticate,  async (req, res) => {
  const user_id = req.user.id;
  const { email, phone, shop_name, name, address } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET email = $1, phone = $2, shop_name = $3, name = $4, address = $5 WHERE id = $6 RETURNING *',
      [email, phone, shop_name, name, address, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("Updated User Profile:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.log('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Reset password endpoint
app.post('/reset-password', authenticate, async (req, res) => {
  const { newPassword } = req.body;
  const user_id = req.user.id;
  
  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user_id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
