export const msalConfig = {
  auth: {
    clientId: "c1fa6099-9cb7-4f30-aa4b-c22b3739e129",  
    authority: "https://login.microsoftonline.com/5071a4e0-9c1a-45fc-9c4f-e8fc5f6487e8", // Directory (tenant) ID
    redirectUri: "http://localhost:3000", // Must match Redirect URI in Azure Portal (SPA)
  },
  cache: {
    cacheLocation: "localStorage", // Keeps token in localStorage (recommended for SPA)
    storeAuthStateInCookie: false, // Use true if facing issues in IE/Edge
  },
};

 


// This scope matches the "Expose an API" → scope in Azure (API permission)
export const loginRequest = {
  scopes: ["User.Read","openid", "profile", "api://c1fa6099-9cb7-4f30-aa4b-c22b3739e129/access_as_user"],
};
 