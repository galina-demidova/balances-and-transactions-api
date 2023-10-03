import request from "supertest";
import app from "../../src/app";

describe("Balance and Transactions API", () => {
  describe("GET /historical-balances", () => {
    it("should return an error because of missing from and to", async () => {
      const response = await request(app).get("/historical-balances");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        "error": "Required from/to query params are missing",
      });
    });
  });

  describe("GET /historical-balances", () => {
    it("should return an error because to > from", async () => {
      const response = await request(app).get("/historical-balances?from=2022-01-05&to=2022-01-03");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        "error": "'to' date must not be earlier than 'from' date",
      });
    });
  });
});
