require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;  // ✅ Render requires process.env.PORT

app.use(cors());
app.use(express.json());

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_API_URL = "https://connect.squareup.com/v2/catalog/list";

// ✅ Route: Fetch Products from Square
app.get('/products', async (req, res) => {
    try {
        const response = await fetch(SQUARE_API_URL, {
            method: "GET",
            headers: {
                "Square-Version": "2025-02-20",
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Square API error! Status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("🚨 Square API error:", error.message);
        res.status(500).json({ error: "Failed to fetch products from Square API" });
    }
});

// ✅ Ensure Render detects an open port
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
