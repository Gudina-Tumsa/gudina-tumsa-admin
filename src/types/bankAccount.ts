export interface BankAccount {
    _id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BankAccountsResponse {
    success: boolean;
    data: {
        accounts: BankAccount[];
    };
}

export interface BankAccountResponse {
    success: boolean;
    data: {
        account: BankAccount;
    };
}
