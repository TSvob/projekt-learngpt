import React, { createContext, useState, useEffect } from "react";

interface User {
  id: string;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    // Attempt to retrieve the user from localStorage on initial load
    const storedUser = localStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  useEffect(() => {
    // Update localStorage whenever the user changes
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, [user]);

  useEffect(() => {
    // Update localStorage whenever the token changes
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
};

// Move the 'useUser' function to a separate file, such as 'useUser.ts' in the same directory.
// Then, export the 'useUser' function from that file.
// This will allow the 'UserContext.tsx' file to only export components and resolve the eslint problem.
// Example code for 'useUser.ts':
// FILEPATH: /Users/tomassvoboda/Desktop/Informatika/learn-gpt/frontend/src/contexts/useUser.ts
