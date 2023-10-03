import differenceInCalendarDays from "date-fns/differenceInCalendarDays";

export class DateRangeWithAmountsCalculator {
    private readonly start: Date
    private readonly end: Date
    private readonly numberOfDays: number
    private readonly dailyTransactionSums: number[]
    private afterEndDateTransactionSum = 0

    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
        this.numberOfDays = differenceInCalendarDays(end, start) + 1;
        this.dailyTransactionSums = Array(this.numberOfDays).fill(0)
    }

    addAmount(date: Date, amount: number) {
        const daysFromStart = differenceInCalendarDays(date, this.start);
        if (daysFromStart >= 0 && daysFromStart < this.numberOfDays) {
            this.dailyTransactionSums[daysFromStart] += amount;
        } else if (daysFromStart >= this.numberOfDays) {
            this.afterEndDateTransactionSum += amount;
        }
    }

    toAmountsAtDates(currentAmount: number): Array<{ amount: number, date: Date }> {
        const amountsAtDates = Array(this.numberOfDays);
        amountsAtDates[this.numberOfDays - 1] = {
            amount: currentAmount - this.afterEndDateTransactionSum,
            date: this.end
        }

        for (let i = this.numberOfDays - 1; i > 0; i--) {
            amountsAtDates[i - 1] = {
                amount: amountsAtDates[i].amount - this.dailyTransactionSums[i],
                date: this.copyDecrementingOneDay(amountsAtDates[i].date)
            }
        }

        return amountsAtDates;
    }

    private copyDecrementingOneDay(date: Date): Date {
        const result = new Date(date);
        result.setDate(date.getDate() - 1);
        return result;
    }
}
