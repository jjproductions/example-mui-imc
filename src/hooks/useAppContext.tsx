import { createContext, ReactNode, useContext, useState } from "react";
import { alertStatus, appContext, Expense, receiptImageInfo } from "../types";
import { validateHeaderValue } from "http";


// Create context
const AppContext = createContext<appContext | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newReportItems, setNewReportItems] = useState<Expense[] | undefined>(undefined); //expenses for current report
  const [activeReportItem, setActiveReportItem] = useState<Expense | undefined>(undefined); //expense detail for current report
  const [receiptImg, setReceiptImg] = useState<receiptImageInfo[]>([]); //receipt image for active report item
  const [currReportExpenses, setCurrReportExpenses] = useState<Expense[] | undefined>(undefined);  //expenses included in current report
  //const [editInProgress, setEditInProgress] = useState<boolean>(false); //flag to indicate if an edit is in progress
  const [editInProgressFlag, setEditInProgressFlag] = useState<boolean>(true); //used to signal if edits are in progress
  const [currReportItemsToDelete, setCurrReportItemsToDelete] = useState<number[]>([]); //array of rpt ID items to delete
  const [alertMsg, setAlertMsg] = useState<alertStatus>({ open: false, message: "", severity: "info" });

  // Function to update the report items
  const ReportSetUp = (report: Expense[] | undefined, reportUpdate: string = "NEWREPORT") => {
    switch (reportUpdate) {
      case "NEWREPORT":
        console.log(`ReportSetup:NEWREPORT ${JSON.stringify(report)}`);
        setNewReportItems(report);
        setActiveReportItem(report ? report[0] : undefined);
        //setCurrReportExpenses(undefined);
        break;
      case "CURRENTREPORT":
        console.log(`ReportSetup:CURRENTREPORT ${JSON.stringify(report)}`);
        setCurrReportExpenses(report);
        // setActiveReportItem(undefined);
        break;
      case "ACTIVEREPORT":
        console.log(`ReportSetup:ACTIVEREPORT ${JSON.stringify(report)}`);
        setActiveReportItem(report ? report[0] : undefined);
        break;
      case "INITIALREPORT":
        console.log(`ReportSetup:INITIALREPORT ${JSON.stringify(report)}`);
        setNewReportItems(report);
        break;
      default:
        break;
    }
  };

  // const ReportAmount = (amountChanged: number, amount: number | null = null) => {
  //   setAmountTotal(amount ? amount as number : amountTotal + amountChanged);
  // }

  const myValue = {
    newReportItems,
    ReportSetUp,
    activeReportItem,
    currReportExpenses,
    currReportItemsToDelete,
    setCurrReportItemsToDelete,
    editInProgressFlag,
    setEditInProgressFlag,
    receiptImg,
    setReceiptImg,
    alertMsg,
    setAlertMsg
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