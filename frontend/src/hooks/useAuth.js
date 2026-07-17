import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem("fraudshield_token");
        const savedUser = localStorage.getItem("fraudshield_user");

        if (!savedToken || !savedUser) {
          setLoading(false);
          return;
        }

        // Verify token is still valid with Flask
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = {
            ...JSON.parse(savedUser),
            // Refresh from server in case role changed
            role: data.user.role,
            name: data.user.name,
            token: savedToken,
          };
          setUser(userData);
        } else {
          // Token invalid or expired — clear storage
          localStorage.removeItem("fraudshield_token");
          localStorage.removeItem("fraudshield_user");
        }
      } catch {
        // Flask not running — clear session
        localStorage.removeItem("fraudshield_token");
        localStorage.removeItem("fraudshield_user");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("fraudshield_user", JSON.stringify(userData));
    localStorage.setItem("fraudshield_token", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fraudshield_token");
    localStorage.removeItem("fraudshield_user");
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
