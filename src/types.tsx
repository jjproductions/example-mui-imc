
export type LoginType = {
  email: string;
  password: string;
  remember_me?: boolean | undefined;
}

export interface ProviderProps {
  userInfo: UserType | null,
  token: string | null,
  Login(data: LoginType): Promise<string | null>,
  Logout(): void,
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
  reportItems: Expense[] | undefined,
  ReportSetUp: (report: Expense[] | undefined) => void,
  activeReportItem: Expense | undefined,
  reportExpenses: Expense[] | undefined,
  setReportExpenses: (ReportExpenses: Expense[] | undefined) => void,
  editInProgress: boolean,
  setEditInProgress: (isEdit: boolean) => void
}

export interface ReportInfo {
  id: number;
  name: string;
  status: string;
  created: string;
  modified: string;
}

export interface ReportHeaderInfo {
  id: number;
  name: string;
  amount: number;
  cardNumber: number;
  canEdit: boolean;
}