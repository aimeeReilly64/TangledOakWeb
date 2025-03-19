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

        // Ensure data.objects exists and is an array
        if (!data.objects || !Array.isArray(data.objects)) {
            throw new Error("Invalid product data format from Square API");
        }

        // Extract relevant product details
        const formattedProducts = data.objects.map(item => {
            // Check if item_data and variations exist and are valid
            if (!item.item_data || !Array.isArray(item.item_data.variations) || item.item_data.variations.length === 0) {
                console.warn(`Item ${item.id} is missing variations.`);
                return null; // Skip items without valid variations
            }

            // Find the first variation with valid price information
            const validVariation = item.item_data.variations.find(variation => variation.item_variation_data && variation.item_variation_data.price_money);

            if (!validVariation) {
                console.warn(`Item ${item.id} has no variations with valid price information.`);
                return null; // Skip items without valid price information
            }

            return {
                upc: item.id,
                name: item.item_data.name,
                description: item.item_data.description || "No description available",
                price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                vendor: item.item_data.vendor_ids?.[0] || "Unknown Vendor",
                category: item.item_data.category_ids?.[0] || "Uncategorized"
            };
        }).filter(item => item !== null); // Remove null items

        // Sort products by name in ascending order
        formattedProducts.sort((a, b) => a.name.localeCompare(b.name));
        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Ensure server starts properly
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
