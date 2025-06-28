import React from "react";
import { useMsal } from "@azure/msal-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { instance, accounts } = useMsal();
  const isLoggedIn = accounts.length > 0;

  const handleLogout = () => {
    instance.logoutRedirect();
  };
  console.log('hello account',accounts)
  return (
    <nav style={{ backgroundColor: "#333", color: "#fff", padding: "10px" }}>
      <Link to="/" style={{ color: "#fff", marginRight: "20px" }}>
        Home
      </Link>
      {isLoggedIn && (
        <>
          <Link to="/dashboard" style={{ color: "#fff", marginRight: "20px" }}>
            Dashboard
          </Link>
          <span>{accounts[0]?.username}</span>
          <button onClick={handleLogout} style={{ marginLeft: "20px" }}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
