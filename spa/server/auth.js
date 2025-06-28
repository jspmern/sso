// middleware/auth.js
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

//👤 User logs in via Azure and receives an access token.
//🧠 Your backend (auth.js) extracts the kid (key ID) from the JWT header.
//📡 jwks-rsa fetches the corresponding public key from Azure’s JWKS endpoint.
//🔍 jsonwebtoken uses that key to verify the token’s signature and decode the payload.

// Initialize JWKS client to fetch signing keys from Microsoft
const client = jwksClient({
  jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
});

// Dynamically provide signing key based on 'kid' in token header
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware to verify incoming JWT access tokens
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Access token missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      audience: "c1fa6099-9cb7-4f30-aa4b-c22b3739e129", // 👈 Your actual CLIENT ID
      issuer: "https://login.microsoftonline.com/5071a4e0-9c1a-45fc-9c4f-e8fc5f6487e8/v2.0", // 👈 Issuer = TENANT ID
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).send("Unauthorized: Invalid token");
      }

      req.user = decoded;
      next();
    }
  );
};

module.exports = verifyToken;
