
export type LoginType = {
    email: string;
    password: string;
    remember_me?: boolean | undefined;
}

export interface ProviderProps {
    userInfo:  UserType | null,
    token:  string | null,
    Login (data: LoginType ): Promise<string | null>,
    Logout() :void,
}

export interface Expense {
    transactionDate: string;
    postDate: string;
    amount: number;
    description: string;
    cardNumber: number;
    category: string;
    type: string;
    memo: string;
  }

export interface Expense2 {
  Amount: number;
  CardNumber: number;
  TransactionDate: string;
  PostDate: string;
  Category: string;
  Description: string;
  Type: string;
  Memo: string;
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