
export type LoginType = {
  email: string;
  password: string;
  remember_me?: boolean | undefined;
}

export interface ProviderProps {
  userInfo: UserType | null,
  Login(data: LoginType): Promise<string | null>,
  Logout(): void,
  creditCard: string | null,
  setCreditCard: (card: string) => void
}

export interface Expense {
  id: number | null;
  transactionDate: string;
  postDate: string;
  amount: number;
  description: string;
  cardNumber: number;
  category: string;
  type: string;
  memo: string;
  reportID: number | null;
  receiptUrl: string | undefined;
}

export interface users {
  id: number;
  name: string;
  email: string;
  card: number;
  cardId: number;
  active: boolean;
}

export interface bankExpense {
  Amount: string;
  Card: string;
  "Transaction Date": string;
  "Post Date": string;
  Category: string;
  Description: string;
  Type: string;
  Memo: string;
}

export interface UserType {
  user: string | null,
  isAdmin: boolean,
  role: string | null
}

export interface gridType {
  items: Expense[] | undefined,
  showCheckBox?: boolean
}

export interface appContext {
  newReportItems: Expense[] | undefined,
  ReportSetUp: (report: Expense[] | undefined, reportUpdate: string) => void,
  activeReportItem: Expense | undefined,
  currReportExpenses: Expense[] | undefined,
  currReportItemsToDelete: number[],
  setCurrReportItemsToDelete: (items: number[]) => void,
  editInProgressFlag: boolean,
  setEditInProgressFlag: (isEdit: boolean) => void,
  receiptImg: receiptImageInfo[],
  setReceiptImg: (receiptImages: receiptImageInfo[]) => void
  alertMsg: alertStatus,
  setAlertMsg: (alert: alertStatus) => void
}

export interface ReportInfo {
  id: number;
  name: string;
  status: reportStatus;
  created: string;
  modified: string;
  memo?: string;
}

export interface ReportHeaderInfo {
  id?: number;
  name?: string;
  amount?: number;
  cardNumber?: number;
  editInProgress: boolean;
  status?: reportStatus;
}

export interface StatementUpdate {
  id: number;
  reportId?: number;
  category: string;
  description: string;
  type: string;
  memo?: string;
  receiptUrl?: string;
}

export interface ReportUpdate {
  cardNumber: number;
  reportMemo?: string;
  reportName: string;
  reportId?: number;
  itemsToDelete: number[];
  status?: reportStatus;
  statements: StatementUpdate[];
}

export interface reportDeleteRequest {
  reportId: number;
  itemsToDelete: number[];
}

export interface receiptImageInfo {
  name: string;
  image: File;
  contentType: string;
  expenseId: number;
  reportId: number;
}

export interface receiptImageResponse {
  expenseId: number;
  url: string;
}

export interface alertStatus {
  open: boolean;
  message: string;
  severity: "error" | "info" | "success" | "warning";
}

export interface newReportRequest {
  cardNumber: number;
  name: string;
  memo: string;
  status: reportStatus;
}

export interface ReportRequest {
  reportid: number;
  status: reportStatus;
  memo?: string;
}

export interface sasTokenRefreshRequest {
  containerName?: string;
  blobName: string;
}

export interface sasTokenCache {
  token: string;
  key: string;
  expiration: string;
}

export enum reportStatus {
  PENDING = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  RETURNED = 3,
  DELETED = 4,
  NEW = 5
}