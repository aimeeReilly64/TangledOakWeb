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

/** Fetch Categories */
const fetchCategories = async () => {
    const response = await fetch(SQUARE_API_URL, {
        method: "POST",  // ✅ Square API requires GET, not POST.. are you sure?
        headers: {
            "Square-Version": "2025-02-20",
            "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    if (!data.objects) return {}; // Return empty if no categories exist

    return data.objects.reduce((map, obj) => {
        if (obj.type === "CATEGORY" && obj.category_data) {
            map[obj.id] = obj.category_data.name;
        }
        return map;
    }, {});
};


/** Fetch Products */
app.get('/products', async (req, res) => {
    try {
        const response = await fetch(SQUARE_API_URL, {
            method: "POST",
            headers: {
                "Square-Version": "2025-02-20",
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                object_types: ["ITEM"],
                include_related_objects: true
            })
        });

        if (!response.ok) {
            throw new Error(`Square API error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Extract and format product details
        const formattedProducts = data.objects.map(item => {
            if (!item.item_data || !item.item_data.variations || item.item_data.variations.length === 0) {
                console.warn(`Item ${item.id} is missing variations.`);
                return null; // Skip items without valid variations
            }

            // Find the first variation with valid price information
            const validVariation = item.item_data.variations.find(
                variation => variation.item_variation_data && variation.item_variation_data.price_money
            );

            if (!validVariation) {
                console.warn(`Item ${item.id} has no variations with valid price information.`);
                return null; // Skip items without valid price information
            }

            return {
                upc: item.id,
                name: item.item_data.name,
                description: item.item_data.description || "No description available",
                price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                category: categoryName,
                date: item.item_data.updated_at,
                vendor: item.item_variation_data.vendor_id , // Square API returns an array, so we use the first vendor if available.
                image: item.item_data.image_ids?.[0],  // Square API returns an array, so we use the first image if available.
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

/** Start the Server */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
