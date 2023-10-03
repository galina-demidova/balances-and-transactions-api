import { Currency, failOnErrorResponse, validateCurrency } from "./common";
import { API_KEY, ROOT_URL } from "./constants";

export async function getBalance(): Promise<BalanceResponse> {
    const response = await fetch(ROOT_URL + '/balances', {
        method: 'GET',
        headers: {'Content-type': 'application/json; charset=UTF-8', 'x-api-key': API_KEY},
    });

    const jsonData = (await response.json()) as {
        amount: number,
        currency: string,
        date: string,
    };

    failOnErrorResponse(response, jsonData)

    console.log(`Received current balance ${JSON.stringify(jsonData)}`)

    return new BalanceResponse(
        new Date(jsonData.date),
        jsonData.amount,
        validateCurrency(jsonData.currency)
    );
}

export class BalanceResponse {
    public readonly date: Date;
    public readonly amount: number;
    public readonly currency: Currency;

    constructor(date: Date, amount: number, currency: Currency) {
        this.date = date;
        this.amount = amount;
        this.currency = currency;
    }
}
