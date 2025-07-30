import { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      getUser(); // Fetch from API if not in storage
    }
  }, []);

  const getUser = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getProfile`, {
        withCredentials: true, // Required for cookies-based auth
      });
      if (response.data) {
        setUser(response.data.user);
        setRole(response.data.user.role);
        setIsLoggedIn(true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role);
      }
    } catch (error) {
      // Don't log the full error to console in production - it's expected for non-logged in users
      if (error.response && error.response.status === 401) {
        // Expected error for non-logged in users, handle silently
        console.info("User is not logged in");
      } else {
        console.error("Error fetching user data:", error);
      }
      // Clear any potentially outdated data
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setUser(null);
      setRole(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, setUser, setRole, loading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);