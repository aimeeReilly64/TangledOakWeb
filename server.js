require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ['https://superlative-vacherin-5e9b5d.netlify.app'],
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_API_URL = "https://connect.squareup.com/v2/catalog/list";
const SQUARE_API_VERSION = "2025-02-20";

/** Fetch Products */
app.get('/products', async (req, res) => {
    try {
        const response = await fetch(SQUARE_API_URL, {
            method: "GET",
            headers: {
                "Square-Version": SQUARE_API_VERSION,
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Square API error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.objects) {
            return res.json([]);
        }

        // Extract and format product details
        const formattedProducts = data.objects
            .filter(item => item.type === "ITEM" && item.item_data)
            .map(item => {
                const variations = item.item_data.variations || [];
                const firstVariation = variations.find(v => v.item_variation_data?.price_money) || {};
                const priceMoney = firstVariation.item_variation_data?.price_money || { amount: 0, currency: "CAD" };

                // Find image sources
                let imageUrl = 'https://via.placeholder.com/150'; // Default placeholder
                if (item.item_data.image_ids?.length) {
                    imageUrl = `https://square-cdn.com/square/${item.item_data.image_ids[0]}`;
                } else if (item.item_data.ecom_image_uris?.length) {
                    imageUrl = item.item_data.ecom_image_uris[0];
                } else if (firstVariation.item_variation_data?.image_ids?.length) {
                    imageUrl = `https://square-cdn.com/square/${firstVariation.item_variation_data.image_ids[0]}`;
                }

                return {
                    id: item.id,
                    name: item.item_data.name || "Unnamed Product",
                    description: item.item_data.description_plaintext || "No description available",
                    price: priceMoney.amount / 100, // Convert cents to dollars
                    currency: priceMoney.currency,
                    updated_at: item.updated_at || item.item_data.updated_at || "Unknown",
                    image_url: imageUrl,
                    product_url: item.item_data.ecom_uri || "#" // E-commerce product link
                };
            })
            .filter(item => item !== null) // Remove null items
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // Sort by newest first
            .slice(0, 6); // Limit to 6 products

        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

/** Start the Server */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
