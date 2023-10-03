import { Currency, failOnErrorResponse, validateCurrency } from "./common";
import { API_KEY, ROOT_URL } from "./constants";

export async function getTransactions(): Promise<Array<Transaction>> {
    const response = await fetch(ROOT_URL + '/transactions', {
        method: 'GET',
        headers: {'Content-type': 'application/json; charset=UTF-8', 'x-api-key': API_KEY},
    });

    let jsonData = (await response.json()) as {
        transactions: Array<{
            date: string
            amount: number
            currency: string
            status: string
        }>
    }

    failOnErrorResponse(response, jsonData)

    console.log(`Received ${jsonData.transactions.length} transactions`)

    return jsonData.transactions.map((transaction) => {
        return new Transaction(
            new Date(transaction.date),
            transaction.amount,
            validateCurrency(transaction.currency),
            validateStatus(transaction.status)
        );
    })
}

function validateStatus(status: string): TransactionStatus {
    if (status !== 'BOOKED'
        && status !== 'PROCESSED'
        && status !== 'CANCELLED') {
        throw new Error("Unsupported transaction status: " + status);
    }
    return status;
}

export class Transaction {
    public readonly date: Date;
    public readonly amount: number;
    public readonly currency: Currency;
    public readonly status: TransactionStatus;

    constructor(date: Date, amount: number, currency: Currency, status: TransactionStatus) {
        this.date = date;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }
}

export type TransactionStatus = 'BOOKED' | 'PROCESSED' | 'CANCELLED';