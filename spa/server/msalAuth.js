const { ConfidentialClientApplication } = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const config = require("./authConfig");

const cca = new ConfidentialClientApplication({
  auth: config.auth,
});

async function verifyToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).send("No token");

  const token = auth.split(" ")[1];

  try {
    // Step 1: Exchange the token for another token using OBO
    const result = await cca.acquireTokenOnBehalfOf({
      authority: config.auth.authority,
      oboAssertion: token,
      scopes: [`api://${process.env.API_CLIENT_ID}/access_as_user`],
    });

    // Step 2: Decode token to extract user info
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).send("Token decode failed");
    }

    req.user = {
      name: decoded.name,
      preferred_username: decoded.preferred_username,
      oid: decoded.oid,
      roles: decoded.roles || [],
    };

    next();
  } catch (err) {
    console.error("OBO Token validation failed:", err.message);
    res.status(401).send("Unauthorized");
  }
}

module.exports = verifyToken;
