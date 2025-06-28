# 🔐 Secure MERN App with Microsoft Identity (Azure AD)

Full-stack **MERN** 🥭 (MongoDB, Express, React, Node.js) app 🔐 secured via Microsoft Identity 🌐 (Azure AD). Features 🧠 authentication with MSAL 🎭 (frontend) & access token 🎟️ validation with `jwks-rsa` + `jsonwebtoken` (backend).

---

## 📦 Tech Stack

| 🧱 Layer    | 🧰 Stack                                       |
| ----------- | ---------------------------------------------- |
| 🎨 Frontend | ⚛️ React + 🚦 React Router + 🔐 MSAL React     |
| 🔧 Backend  | 🟩 Node.js + 🧭 Express + 🔑 jwks-rsa + 🪪 JWT |
| 👥 Identity | ☁️ Azure AD (Microsoft Identity)               |
| 🔄 Flow     | 🔐 Authorization Code Flow w/ PKCE             |

---

## 🧾 Azure Setup

1️⃣ Go to [Azure Portal](https://portal.azure.com) → 🆔 **Microsoft Entra ID** → 📘 **App registrations** → ➕ **New registration**
2️⃣ Name: `new-app`
3️⃣ Account types: 🏢 *My org only*

### 🔹 Auth Tab

* Platform: 🧑‍💻 **SPA**
* Redirect URI: `http://localhost:3000`
* ✔️ Check `ID tokens`

### 🔹 API Exposure

* App ID URI: `api://<CLIENT_ID>`
* ➕ Scope:

  * Name: `access_as_user`
  * Admin consent name: `Access new-app API`
  * ✅ Enabled

### 🔹 API Permissions

* ➕: `openid`, `profile`, & custom scope
* ✅ Grant admin consent

### 🔹 Certs & Secrets

* 🔑 Generate Client Secret
* 🗄️ Save the Value

---

## 🔐 `.env` File

Create `server/.env`:

```env
PORT=5000
CLIENT_ID=your-client-id
TENANT_ID=your-tenant-id
CLIENT_SECRET=your-client-secret
```

---

## 🧪 Backend: Express + JWT

### 🗂️ `server/server.js`

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/protected', auth, (req, res) => {
  res.json({ message: '👋 Hello, protected!', user: req.user });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server on ${process.env.PORT}`)
);
```

### 🔐 `server/middleware/auth.js`

```js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(err, key.getPublicKey());
  });
}

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('🚫 No token');

  jwt.verify(token, getKey, {
    audience: process.env.CLIENT_ID,
    issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
    algorithms: ['RS256'],
  }, (err, decoded) => {
    if (err) return res.status(401).send('🚫 Unauthorized');
    req.user = decoded;
    next();
  });
};
```

---

## 💻 Frontend: React + MSAL

🛠️ Install:

```bash
npm i @azure/msal-browser @azure/msal-react react-router-dom axios
```

### 🧠 `src/authConfig.js`

```js
export const msalConfig = {
  auth: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['api://your-client-id/access_as_user']
};
```

### 🌐 `src/index.js`

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AutoLogout from './AutoLogout';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MsalProvider instance={msalInstance}>
    <AutoLogout>
      <App />
    </AutoLogout>
  </MsalProvider>
);
```

### 🧭 `src/App.js`

```js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
```

### 🔒 `src/ProtectedRoute.js`

```js
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}
```

### ⏰ `src/AutoLogout.js`

```js
import { useMsal } from '@azure/msal-react';
import { useEffect, useRef } from 'react';

export default function AutoLogout({ children }) {
  const { instance } = useMsal();
  const timer = useRef();

  const reset = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      instance.logoutRedirect();
    }, 2 * 60 * 1000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    reset();
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
    };
  }, []);

  return <>{children}</>;
}
```

### 🏠 `src/Home.js`

```js
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

export default function Home() {
  const { instance } = useMsal();

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>👋 Welcome</h1>
      <button onClick={() => instance.loginRedirect(loginRequest)}>
        🔐 Login with Microsoft
      </button>
    </div>
  );
}
```

### 📊 `src/Dashboard.js`

```js
import { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import axiosInstance from './axiosInstance';

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || accounts.length === 0) return;
      try {
        const authResult = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });

        const res = await axiosInstance.get('/protected', {
          headers: { Authorization: `Bearer ${authResult.accessToken}` }
        });

        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [isAuthenticated, accounts]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📈 Dashboard</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : '⏳ Loading...'}
    </div>
  );
}
```

### 🧭 `src/Navbar.js`

```js
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

export default function Navbar() {
  const { instance, accounts } = useMsal();
  const loggedIn = accounts.length > 0;

  return (
    <nav style={{ background: '#222', padding: 10, color: '#fff' }}>
      <Link to="/" style={{ color: '#fff', marginRight: 20 }}>🏠 Home</Link>
      {loggedIn && (
        <>
          <Link to="/dashboard" style={{ color: '#fff', marginRight: 20 }}>📊 Dashboard</Link>
          <span>{accounts[0].username}</span>
          <button onClick={() => instance.logoutRedirect()} style={{ marginLeft: 20 }}>
            🚪 Logout
          </button>
        </>
      )}
    </nav>
  );
}
```

### 🔧 `src/axiosInstance.js`

```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

export default axiosInstance;
```

---

## ✅ Test Cases

| ✔️ Scenario                   | 🎯 Result            |
| ----------------------------- | -------------------- |
| Access `/dashboard` w/o login | ↪️ Redirect to `/`   |
| Login → `/dashboard`          | ✅ Shows protected 📊 |
| Missing token                 | ❌ 401 Unauthorized   |
| Invalid token                 | ❌ 401 Unauthorized   |
| Idle > 2 mins                 | 🔒 Auto logout       |

---

## 🚀 Run Project

```bash
# 🔧 Backend
cd server
npm i
node server.js

# 🖥️ Frontend
npm i
npm start
```

---

## 🧠 Learn More

* 📘 [MSAL.js Docs](https://github.com/AzureAD/microsoft-authentication-library-for-js)
* 🔧 [Azure Portal](https://portal.azure.com)
* 🔑 [jwks-rsa](https://www.npmjs.com/package/jwks-rsa)

&#x20;
