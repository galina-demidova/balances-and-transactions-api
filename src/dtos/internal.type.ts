import { Currency } from "../clients/common";

export class BalanceDto {
    public date: Date;
    public amount: number;
    public currency: Currency;

    constructor(date: Date, amount: number, currency: Currency) {
        this.date = date;
        this.amount = amount;
        this.currency = currency;
    }
}