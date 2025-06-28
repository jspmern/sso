import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export default function Login() {
  const { instance } = useMsal();
  function handleLogin() {
    instance.loginPopup(loginRequest).catch(console.error);
  }
  return <button onClick={handleLogin}>Login with Microsoft</button>;
}
