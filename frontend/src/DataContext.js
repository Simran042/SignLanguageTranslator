import React, { createContext, useState, useContext } from "react";

// 1. Create a Context to hold the shared data
const DataContext = createContext();

// 2. Create a custom hook to easily access the context
export const useData = () => useContext(DataContext);

// 3. Create a Provider component to wrap the app and provide the shared data
export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null); // Initialize your state

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children} {/* Provide access to the context to child components */}
    </DataContext.Provider>
  );
};
