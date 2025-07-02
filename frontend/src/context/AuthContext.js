import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { fetchUserProfile } from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true); // Ensure isLoading is true at the start of initialization
      let tempIsLoggedIn = false; // Flag to track login status during initialization
      let tempUser = null; // Temporary user object for internal logic

      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken); // Set token immediately

          // *** CRITICAL CHANGE: Load from localStorage FIRST if a token exists ***
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser); // Set user state optimistically from localStorage
              setIsLoggedIn(true); // Assume logged in for now
              tempUser = parsedUser; // Store for later checks
              tempIsLoggedIn = true;
              console.log("AuthContext: User data loaded from localStorage immediately:", parsedUser);
            } catch (parseError) {
              console.error("AuthContext: Error parsing stored user from localStorage. Clearing corrupted data.", parseError);
              localStorage.removeItem('user'); // Clear corrupted user data
            }
          }

          // *** Then, attempt to fetch fresh user profile from the server ***
          // This runs AFTER (or at least considers) the localStorage load.
          try {
            const { data } = await fetchUserProfile();
            // Only update if server data is genuinely different or more complete
            if (JSON.stringify(data) !== storedUser) {
              setUser(data); // Update with fresh data from API
              localStorage.setItem('user', JSON.stringify(data)); // Store fresh data
              console.log("AuthContext: User profile updated from API:", data);
            }
            setIsLoggedIn(true); // Confirm logged in based on successful API fetch
            tempUser = data; // Update tempUser with API data
            tempIsLoggedIn = true;
          } catch (apiError) {
            console.warn("AuthContext: Token found, but failed to fetch fresh user profile.", apiError);
            // If API fetch fails, and we couldn't load from localStorage earlier, then we're not logged in.
            // If tempIsLoggedIn is true, it means localStorage successfully set the user, so we rely on that.
            if (!tempIsLoggedIn) { // This means neither API nor initial localStorage parse succeeded
              console.error("AuthContext: No valid user data found after API fetch failed. Clearing authentication state.");
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              setIsLoggedIn(false);
            }
          }
        } else {
          // No token found, so definitely not logged in
          setIsLoggedIn(false);
          setUser(null);
          setToken(null);
          localStorage.removeItem('user'); // Ensure no stale user data when no token
        }
      } catch (e) {
        // This catch handles any unexpected errors during the entire process
        console.error("AuthContext: Unexpected error during authentication initialization. Clearing state.", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false); // Set to false only after all async operations are done
      }
    };

    initializeAuth();
  }, []); // Empty dependency array, runs only once on component mount// Empty dependency array, runs only once on component mount

  const login = (jwtToken, userData) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Store initial user data
    setToken(jwtToken);
    setUser(userData); // Update state immediately
    setIsLoggedIn(true);
    console.log("AuthContext: User logged in, state updated to:", userData);
    // Optionally, if login response is minimal, you might want to fetch full profile here too
    // fetchUserProfile().then(({ data }) => setUser(data)).catch(console.error);
  };
   const updateUser = (newUserData) => {
    console.log("AuthContext: updateUser called with:", newUserData);
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData)); // Also update localStorage
    console.log("AuthContext: User state updated by updateUser to:", newUserData)
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    
  };

  const authContextValue = useMemo(() => ({
    isLoggedIn,
    user,
    token,
    login,
    logout,
    isLoading, // Provide isLoading to consumers
    updateUser,
  }), [isLoggedIn, user, token, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};