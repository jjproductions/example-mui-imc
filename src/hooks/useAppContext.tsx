import { createContext, ReactNode, useContext, useState } from "react";
import { appContext, Expense } from "../types";
import { validateHeaderValue } from "http";


// Create context
const AppContext = createContext<appContext | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reportItems, setReportItems] = useState<Expense[] | undefined>(undefined);
  const [activeReportItem, setActiveReportItem] = useState<Expense | undefined>(undefined);

  // Function to update the report items
  const ReportSetUp = (report: Expense[] | undefined) => {
    setReportItems(report);
  };

  const myValue = {
    reportItems,
    ReportSetUp,
    activeReportItem,
    setActiveReportItem
  }

  return (
    <AppContext.Provider value={myValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for accessing the context
export const useAppContext = (): appContext => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}