// LoginButton.js
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

const LoginButton = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error(e);
    });
  };

  return <button onClick={handleLogin}>Login with Microsoft</button>;
};

export default LoginButton;
