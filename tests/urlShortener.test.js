import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js"; // assuming you export Express app
import dotenv from 'dotenv';
dotenv.config({path : "../.env"});


const {MONGO_HOST : host , MONGO_PORT : dbPort , MONGO_DB : db} = process.env

beforeAll(async () => {
  const MONGO_TEST_URI = `mongodb://${host}:${dbPort}/${db}_test`;
  await mongoose.connect(MONGO_TEST_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("URL Shortener API", () => {
  test("POST /shorten should return a short URL", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "https://www.google.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.shortUrl).toBeDefined();
  });

  test("GET /:code should redirect to the long URL", async () => {
    const shortenRes = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "https://www.github.com" });

    const shortUrl = shortenRes.body.shortUrl;
    const code = shortUrl.split("/").pop();

    const redirectRes = await request(app).get(`/${code}`);
    expect(redirectRes.statusCode).toBe(302); // 302 redirect
    expect(redirectRes.headers.location).toBe("https://www.github.com");
  });
});
