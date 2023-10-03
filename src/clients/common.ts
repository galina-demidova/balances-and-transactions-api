export type Currency = 'EUR';

export function validateCurrency(currency: string): Currency {
    if (currency !== 'EUR') {
        throw new Error("Unsupported currency: " + currency);
    }
    return currency;
}

export function failOnErrorResponse(resp: Response, jsonData: any) {
    if (!resp.ok) {
        throw Error(`Received error while making request to ${resp.url}, 
        status=${resp.status}, body=${JSON.stringify(jsonData)}`)
    }
}