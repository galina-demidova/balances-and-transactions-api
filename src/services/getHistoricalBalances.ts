import { BalanceResponse, getBalance } from "../clients/balance.client";
import { getTransactions, Transaction } from "../clients/transactions.client";
import { DateRangeWithAmountsCalculator } from "./DateRangeWithAmountsCalculator";
import { BalanceDto } from "../dtos/internal.type";
import { SortOrder } from "../dtos/api.type";

export async function getHistoricalBalance(from: Date, to: Date, sort: SortOrder): Promise<Array<BalanceDto>> {
    const [currentBalance, transactions] = await Promise.all([getBalance(), getTransactions()]);
    const historicalBalance = calculateHistoricalBalance(from, to, transactions, currentBalance);
    if (sort === 'desc') {
        return historicalBalance.sort((b1, b2) => b2.date.getTime() - b1.date.getTime())
    } else {
        return historicalBalance;
    }
}

export function calculateHistoricalBalance(from: Date, to: Date, transactions: Array<Transaction>, currentBalance: BalanceResponse): Array<BalanceDto> {
    const calculator = new DateRangeWithAmountsCalculator(from, to);

    transactions.forEach(transaction =>
        calculator.addAmount(transaction.date, amountDifferenceAfterTransaction(transaction)));

    return calculator.toAmountsAtDates(currentBalance.amount)
        .map(amountAtDate => new BalanceDto(amountAtDate.date, amountAtDate.amount, 'EUR'))
}

function amountDifferenceAfterTransaction(transaction: Transaction): number {
    const {amount, status} = transaction;
    if (amount < 0) {
        if (status === "BOOKED") {
            return amount;
        }
        if (status === "CANCELLED") {
            return -amount;
        }
    } else {
        if (status === "PROCESSED") {
            return amount;
        }
    }
    return 0;
}
