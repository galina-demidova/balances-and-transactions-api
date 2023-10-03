import { calculateHistoricalBalance } from "../../src/services/getHistoricalBalances";
import { Transaction } from "../../src/clients/transactions.client";
import { BalanceResponse } from "../../src/clients/balance.client";
import { BalanceDto } from "../../src/dtos/internal.type";


describe("getHistoricalBalance", () => {
    const from = new Date('2021-05-01');
    const to = new Date('2021-05-03');
    const currentBalance = new BalanceResponse(new Date('2021-05-08T23:59:59.577Z'), 10000, 'EUR');

    const bookedOutbound = new Transaction(new Date('2021-05-02T09:57:27.235Z'), -1000, 'EUR', 'BOOKED');
    const bookedInbound = new Transaction(new Date('2021-05-02T11:57:27.235Z'), +1000, 'EUR', 'BOOKED');
    const processedOutbound = new Transaction(new Date('2021-05-02T09:20:27.000Z'), -1000, 'EUR', 'PROCESSED');
    const cancelledInbound = new Transaction(new Date('2021-05-03T09:20:27.000Z'), +1000, 'EUR', 'CANCELLED');
    const expectedBalancesForSingleOutboundTransaction = [
        new BalanceDto(new Date("2021-05-01T00:00:00.000Z"), 11000, 'EUR'),
        new BalanceDto(new Date("2021-05-02T00:00:00.000Z"), 10000, 'EUR'),
        new BalanceDto(new Date("2021-05-03T00:00:00.000Z"), 10000, 'EUR'),
    ]

    it("single booked outbound transaction", () => {
        const transactions = [bookedOutbound]
        const historicalBalance = calculateHistoricalBalance(from, to, transactions, currentBalance);
        expect(historicalBalance).toMatchObject(expectedBalancesForSingleOutboundTransaction);
    });

    it("single booked outbound transaction and ignored transactions - same result", () => {
        const transactions = [bookedOutbound, bookedInbound, processedOutbound, cancelledInbound]
        const historicalBalance = calculateHistoricalBalance(from, to, transactions, currentBalance);
        expect(historicalBalance).toMatchObject(expectedBalancesForSingleOutboundTransaction);
    });

    it("no transactions", () => {
        const historicalBalance = calculateHistoricalBalance(from, to, [], currentBalance);
        expect(historicalBalance).toMatchObject([
            new BalanceDto(new Date('2021-05-01'), 10000, 'EUR'),
            new BalanceDto(new Date('2021-05-02'), 10000, 'EUR'),
            new BalanceDto(new Date('2021-05-03'), 10000, 'EUR'),
        ]);
    });

    it("check multiple transactions before, in and after the requested period", () => {
        const beforePeriod1 = new Transaction(new Date('2021-04-30T12:00:05.100Z'), -1000, 'EUR', 'BOOKED');
        const beforePeriod2 = new Transaction(new Date('2021-05-01T09:57:27.235Z'), -5000, 'EUR', 'BOOKED');
        const insidePeriod1 = new Transaction(new Date('2021-05-02T11:45:15.235Z'), -1000, 'EUR', 'BOOKED');
        const insidePeriod2 = new Transaction(new Date('2021-05-02T20:00:02.235Z'), -2000, 'EUR', 'BOOKED');
        const insidePeriod3 = new Transaction(new Date('2021-05-02T19:00:02.235Z'), -5000, 'EUR', 'CANCELLED');
        const insidePeriod4 = new Transaction(new Date('2021-05-03T17:51:27.002Z'), 1500, 'EUR', 'PROCESSED');
        const afterPeriod1 = new Transaction(new Date('2021-05-04T18:51:27.002Z'), -5000, 'EUR', 'BOOKED');
        const afterPeriod2 = new Transaction(new Date('2021-05-06T18:51:27.002Z'), -1000, 'EUR', 'CANCELLED');

        const transactions = [beforePeriod1, beforePeriod2,
            insidePeriod1, insidePeriod2, insidePeriod3, insidePeriod4, afterPeriod1, afterPeriod2]
        const historicalBalance = calculateHistoricalBalance(from, to, transactions, currentBalance);
        expect(historicalBalance).toMatchObject([
            new BalanceDto(new Date('2021-05-01'), 10500, 'EUR'),
            new BalanceDto(new Date('2021-05-02'), 12500, 'EUR'),
            new BalanceDto(new Date('2021-05-03'), 14000, 'EUR'),
        ]);
    });
});
