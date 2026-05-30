import { useState } from "react";

export const useAuth = () => {
  // Restore user from localStorage on page refresh
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fraudshield_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("fraudshield_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fraudshield_token");
    localStorage.removeItem("fraudshield_user");
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
