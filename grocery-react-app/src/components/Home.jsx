


import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <h1 className='home-title'>Welcome to the Grocery Manager</h1>
      <div className='home-buttons'>
        <button className='home-btn' onClick={() => navigate('/login')}>Login</button>
        <button className='home-btn' onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </div>
  );
}
export default Home;