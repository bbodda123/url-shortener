import express from "express";
import validUrl from "valid-url";
import shortid from "shortid";
import Url from "../models/Url.js";
import dotenv from 'dotenv';
dotenv.config({path : "../.env"});
const router = express.Router();

// Home Page
router.get("/", (req, res) => {
  res.render("index");
});

// Shorten URL
router.post("/shorten", async (req, res) => {
  const longUrl  = req.body.longUrl;
  const baseUrl = `http://localhost:${process.env.APP_PORT}`;
  const valid = validUrl.isUri(longUrl);


  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).send("Invalid base URL");
  }

  if (valid) {
    try {
      let url = await Url.findOne({ longUrl });

      if (url) {
        res.render("result", { longUrl: url.longUrl, shortUrl: url.shortUrl });
      } else {
        const urlCode = shortid.generate();
        const shortUrl = baseUrl + "/" + urlCode;

        url = new Url({ longUrl, shortUrl, urlCode, date: new Date() });
        await url.save();

        res.render("result", { longUrl, shortUrl });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  } else {
    res.status(401).send("Invalid long URL");
  }
});


//  Test Usin Jest
router.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = `http://localhost:${process.env.APP_PORT}`;

  if (!validUrl.isUri(longUrl)) {
    return res.status(401).json({ error: "Invalid long URL" });
  }

  try {
    let url = await Url.findOne({ longUrl });

    if (url) {
      return res.json({ longUrl: url.longUrl, shortUrl: url.shortUrl });
    } else {
      const urlCode = shortid.generate();
      const shortUrl = baseUrl + "/" + urlCode;

      url = new Url({ longUrl, shortUrl, urlCode, date: new Date() });
      await url.save();

      return res.json({ longUrl, shortUrl });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// Redirect
router.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });
    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).send("No URL found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
