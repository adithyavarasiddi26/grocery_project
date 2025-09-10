import React,{useState} from 'react';
import './Signup.css';

function Signup({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phone, shop_name: shopName, name }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! Please login.');
        if (onBack) onBack();
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          &#8592;
        </button>
        <h2 className="signup-title">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          className="signup-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="signup-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="signup-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone"
          className="signup-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Shop Name"
          className="signup-input"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
        />
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
