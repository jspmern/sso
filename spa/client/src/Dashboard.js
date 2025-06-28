import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export default function Navbar() {
  const { instance, accounts } = useMsal();
  const [profileImage, setProfileImage] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (accounts.length === 0) return;

      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });

        const headers = {
          Authorization: `Bearer ${response.accessToken}`,
        };

        // Get user's basic profile info (name, email)
        const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers,
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserInfo({
            name: profileData.displayName,
            email: profileData.mail || profileData.userPrincipalName,
          });
        }

        // Get user's profile photo
        const photoRes = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
          headers,
        });

        if (photoRes.ok) {
          const blob = await photoRes.blob();
          setProfileImage(URL.createObjectURL(blob));
        } else {
          console.warn("No profile photo found");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [accounts, instance]);

  return (
    <div style={styles.navbar}>
      <div style={styles.profileContainer}>
        {profileImage ? (
          <img src={profileImage} alt="Profile" style={styles.avatar} />
        ) : (
          <div style={styles.avatarPlaceholder}>👤</div>
        )}
        <div style={styles.userDetails}>
          <div style={styles.name}>{userInfo.name}</div>
          <div style={styles.email}>{userInfo.email}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    padding: "12px 20px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "flex-end",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  userDetails: {
    marginLeft: 10,
    textAlign: "right",
  },
  name: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  email: {
    fontSize: "12px",
    color: "#666",
  },
};
