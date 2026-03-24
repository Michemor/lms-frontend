import { createContext } from "react";
import { useContext } from "react";


// Create AuthContext
export const AuthContext = createContext();
// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
