import { createContext, ReactNode, useContext, useState } from "react";
import { appContext, Expense } from "../types";
import { validateHeaderValue } from "http";


// Create context
const AppContext = createContext<appContext | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newReportItems, setNewReportItems] = useState<Expense[] | undefined>(undefined); //expenses for current report
  const [activeReportItem, setActiveReportItem] = useState<Expense | undefined>(undefined); //expense detail for current report
  //const [amountTotal, setAmountTotal] = useState<number>(0); //total amount for current report
  const [currReportExpenses, setCurrReportExpenses] = useState<Expense[] | undefined>(undefined);  //expenses included in current report
  const [editInProgress, setEditInProgress] = useState<boolean>(false); //flag to indicate if an edit is in progress
  const [currReportItemsToDelete, setCurrReportItemsToDelete] = useState<number[]>([]); //array of rpt ID items to delete

  // Function to update the report items
  const ReportSetUp = (report: Expense[] | undefined) => {
    console.log(`ReportSetup: ${JSON.stringify(report)}`);
    setNewReportItems(report);
    setActiveReportItem(report ? report[0] : undefined);
  };

  // const ReportAmount = (amountChanged: number, amount: number | null = null) => {
  //   setAmountTotal(amount ? amount as number : amountTotal + amountChanged);
  // }

  const myValue = {
    newReportItems,
    ReportSetUp,
    activeReportItem,
    currReportExpenses,
    setCurrReportExpenses,
    currReportItemsToDelete,
    setCurrReportItemsToDelete,
    editInProgress,
    setEditInProgress
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