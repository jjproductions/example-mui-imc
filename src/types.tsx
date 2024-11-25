
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

  export interface bankExpense {
    Amount: string;
    Card: string;
    Category: string;
    Description: string;
    Memo: string;
    "Post Date": string;
    "Transaction Date": string;
    Type: string;
  }

  export interface UserType {
    user: string | null,
    isAdmin: boolean,
    role: string | null
  }