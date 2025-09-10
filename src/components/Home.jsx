import React from 'react';
import "./Home.css";

function Home({ onLogin, onSignUp }){
    return <div className="home-container">
        <h1 className='home-title'>Welcome to the Grocery Manager</h1>
        <div className='home-buttons'>
          <button className='home-btn' onClick={onLogin}>Login</button>
          <button className='home-btn' onClick={onSignUp}>Sign Up</button>
        </div>
    </div>;
}
export default Home;