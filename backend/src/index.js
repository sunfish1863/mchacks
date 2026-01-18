import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 8000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, msg: "Backend is working!" });
});

// Start Gumloop workflow
app.post("/api/gumloop/start", async (req, res) => {
  try {
    const response = await fetch(process.env.GUMLOOP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GUMLOOP_API_KEY}`,
      },
      body: JSON.stringify({
        website_url: req.body.website_url,
      }),
    });

    const text = await response.text();

    res.json({
      status: response.status,
      body: text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
