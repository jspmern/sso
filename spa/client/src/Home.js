import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export default function Home() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>Welcome to My App</h1>
      <img
        src="https://images.unsplash.com/photo-1749741340022-434e924e8312?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Landing"
        style={{ width: "80%", borderRadius: "10px" }}
      />
      <br /><br />
      <button onClick={handleLogin}>Login with Microsoft</button>
    </div>
  );
}
