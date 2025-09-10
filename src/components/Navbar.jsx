import React from 'react';
import "./Navbar.css";
function Navbar({ onBilling, onStock, onAnalysis, isLoggedIn, onLogout }) {

    function handleLogoutClick(){
        if(window.confirm("Are you sure you want to logout?")){
            onLogout();
        }
    }
  return (
    <nav className='navbar'>
      <h1>Grocery Store</h1>
      <ul>
        <a onClick={onBilling}>Billing</a>
        <a onClick={onStock}>Stock</a>
        <a onClick={onAnalysis}>Analysis</a>
        {isLoggedIn && <a onClick={handleLogoutClick}>Logout</a>}
      </ul>
    </nav>
  );
}

export default Navbar;
