rrequire('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000; // For deployment

app.use(cors({
    origin: ['https://superlative-vacherin-5e9b5d.netlify.app'], // Allow frontend
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

        // Extract relevant product details
        const formattedProducts = data.objects
            .filter(item => item.type === "ITEM" && item.item_data) // Ensure it's an ITEM
            .map(item => {
                const variations = item.item_data.variations?.map(variation => ({
                    id: variation.id,
                    name: variation.item_variation_data.name || "Default",
                    price: (variation.item_variation_data.price_money?.amount || 0) / 100, // Convert cents to dollars
                    currency: variation.item_variation_data.price_money?.currency || "CAD"
                })) || [];

                const vendorInfo = item.item_data.variations?.[0]?.item_variation_data?.item_variation_vendor_infos?.[0]?.item_variation_vendor_info_data || {};

                return {
                    id: item.id,
                    name: item.item_data.name,
                    description: item.item_data.description || "No description available.",
                    price: (variations[0]?.price || 0), // Default to first variation's price
                    currency: variations[0]?.currency || "CAD",
                    variations: variations, // Include all variations
                    vendorId: vendorInfo.vendor_id || "Unknown Vendor",
                    imageUrl: item.item_data.ecom_image_uris?.[0] || 'placeholder.jpg',
                    ecomUri: item.item_data.ecom_uri || "#"
                };
            });

        res.json({ products: formattedProducts });
    } catch (error) {
        console.error(" Error fetching products:", error.message);
        res.status(500).json({ error: "Failed to fetch products." });
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
