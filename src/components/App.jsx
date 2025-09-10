import React, {useState} from "react";
import './App.css';
import Navbar from './Navbar';
import Login from './Login';
import Home from './Home';
import Signup from "./Signup";
import Billing from "./Billing";
import Stock from "./Stock";
import Analysis from "./Analysis";

function isLoggedIn() {
  return !!localStorage.getItem('token');
}



function App() {
  const [page,setPage] = useState(isLoggedIn()? "billing" : "home");
  const protectedPages = ["billing", "stock", "analysis"];

  const canAccess = isLoggedIn() || page === "home" || page === "login" || page === "signup";

  function handleLogOut(){
    localStorage.removeItem('token');
    setPage("home");
  }

  return (
    <div className="App">
      <Navbar 
        onBilling={() => setPage("billing")}
        onStock={() => setPage("stock")}
        onAnalysis={() => setPage("analysis")}
        isLoggedIn={isLoggedIn()}
        onLogout={handleLogOut}
      />
      {page ==="home" && (
        <Home onLogin={() => setPage("login")} onSignUp={() => setPage("signup")} />
      )}
  {page ==="login" && <Login onBack={() => setPage("home")} onLoginSuccess={() => setPage("billing")} />}
      {page === "signup" && <Signup onBack={() => setPage("home")} />}
      {protectedPages.includes(page) && !isLoggedIn() && (
        <Home onLogin={() => setPage("login")} onSignUp={() => setPage("signup")} />
      )}
      {page === "billing" && isLoggedIn() && <Billing />}
      {page === "stock" && isLoggedIn() && <Stock />}
      {page === "analysis" && isLoggedIn() && <Analysis />}

    </div>
  );
}


export default App;
