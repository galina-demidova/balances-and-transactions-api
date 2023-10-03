import { format } from "date-fns";
import { Currency } from "../clients/common";

export type SortOrder = 'asc' | 'desc'

export class BalanceApiDto {
    public date: string;
    public amount: number;
    public currency: Currency;

    constructor(date: Date, amount: number, currency: Currency) {
        this.date = format(date, "dd/MM/yyyy");
        this.amount = amount;
        this.currency = currency;
    }
}