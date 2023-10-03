import "dotenv/config";
import express, { Request } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { getHistoricalBalance } from "./services/getHistoricalBalances";
import { BalanceApiDto, SortOrder } from "./dtos/api.type";

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/historical-balances", async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        if (!from || !to) {
            respondWithError(res, 400, "Required from/to query params are missing");
            return;
        }
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);
        if (fromDate > toDate) {
            respondWithError(res, 400, "'to' date must not be earlier than 'from' date");
            return;
        }
        const sort: SortOrder = req.query.sort === 'desc' ? 'desc' : 'asc'

        const historicalBalance = await getHistoricalBalance(fromDate, toDate, sort);
        return res.json(historicalBalance.map(b => new BalanceApiDto(b.date, b.amount, b.currency)));
    } catch (err) {
        logError(req, err)
        respondWithError(res, 500, "An error occurred, please try later")
    }
});

function respondWithError(res: any, status: number, error: string) {
    res.status(status).json({error: error})
}

function logError(req: Request, err: unknown) {
    if (!(err instanceof Error)) {
        err = JSON.stringify(err)
    }
    console.log(`Call ${req.method} ${req.url} failed with:\n${err}`);
}

export default app;
