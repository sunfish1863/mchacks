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

app.post("/api/gumloop/start", async (req, res) => {
    try {
        const response = await fetch(process.env.GUMLOOP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GUMLOOP_API_KEY}`,
            },
            body: JSON.stringify({
                maps_url: req.body.maps_url,
                interests: req.body.interests,
            }),
        });

        const data = await response.text();
        console.log(data)

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/gumloop/status/:runId", async (req, res) => {
  try {
    const url = `https://api.gumloop.com/api/v1/get_pl_run?run_id=${req.params.runId}&user_id=${process.env.GUMLOOP_USER_ID}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GUMLOOP_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
