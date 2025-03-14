require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

app.use(cors({
    origin: ['https://superlative-vacherin-5e9b5d.netlify.app'], // Allow your frontend
    methods: ['GET', 'POST'], // Define allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
    credentials: true
}));
const app = express();
const port = process.env.PORT || 3000;  //Render requires process.env.PORT

app.use(cors());
app.use(express.json());

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_API_URL = "https://connect.squareup.com/v2/catalog/list";

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

        const formattedProducts = data.objects
            .filter(item => item.type === "ITEM" && item.item_data) // Ensure it's an ITEM
            .map(item => {
                const firstVariation = item.item_data.variations?.[0]?.item_variation_data || {};
                const vendorInfo = firstVariation.item_variation_vendor_infos?.[0]?.item_variation_vendor_info_data || {};

                return {
                    id: item.id,
                    name: item.item_data.name,
                    description: item.item_data.description || "No description available.",
                    price: (firstVariation.price_money?.amount || 0) / 100, // Convert cents to dollars
                    currency: firstVariation.price_money?.currency || "CAD",
                    vendorId: vendorInfo.vendor_id || "Unknown Vendor",
                    imageUrl: item.item_data.ecom_image_uris?.[0] || 'placeholder.jpg',
                    ecomUri: item.item_data.ecom_uri || "#"
                };
            });

        res.json({ products: formattedProducts });
    } catch (error) {
        console.error("🚨 Error fetching products:", error.message);
        res.status(500).json({ error: "Failed to fetch products." });
    }
});


// Do not remove - Render detects an open port
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
