



import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import Home from './Home';
import Signup from "./Signup";
import Billing from "./Billing";
import Stock from "./Stock";
import Analysis from "./Analysis/Analysis";
import { useAuth } from './AuthContext';
import DisplayBills from "./DisplayBills";

import Profile from "./Profile";
import ResetPassword from "./ResetPassword";




// function isLoggedIn() {
//   return !!localStorage.getItem('token');
// }





function App() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/billing" /> : <Home />} />
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/billing" /> : <Login />
          } />
          <Route path="/signup" element={<Signup />} />
          <Route path="/billing" element={
            isLoggedIn ? <Billing /> : <Navigate to="/login" />
          } />
          <Route path="/stock" element={
            isLoggedIn ? <Stock /> : <Navigate to="/login" />
          } />
          <Route path="/analysis" element={
            isLoggedIn ? <Analysis /> : <Navigate to="/login" />
          } />
          <Route path='/billing/viewbills' element={
            isLoggedIn ? <DisplayBills /> : <Navigate to="/login" />
          } />
          <Route path='/profile' element={
            isLoggedIn ? <Profile /> : <Navigate to="/login" />
          } />
          <Route path='/profile/reset-password' element={
            isLoggedIn ? <ResetPassword /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
