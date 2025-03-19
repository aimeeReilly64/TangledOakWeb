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
    try {
        const response = await fetch(SQUARE_API_URL, {
            method: "GET", // ✅ Corrected from POST to GET
            headers: {
                "Square-Version": "2025-02-20",
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (!data.objects) return {};

        return data.objects.reduce((map, obj) => {
            if (obj.type === "CATEGORY" && obj.category_data) {
                map[obj.id] = obj.category_data.name;
            }
            return map;
        }, {});
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return {};
    }
};

/** Fetch Products */
app.get('/products', async (req, res) => {
    try {
        // Fetch categories first
        const categories = await fetchCategories();

        const response = await fetch(SQUARE_API_URL, {
            method: "GET", // ✅ Corrected from POST to GET
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

        if (!data.objects) {
            return res.json([]);
        }

        // Extract and format product details
        const formattedProducts = data.objects
            .filter(item => item.type === "ITEM" && item.item_data) // ✅ Filter only ITEM types
            .map(item => {
                const validVariation = item.item_data.variations?.find(
                    variation => variation.item_variation_data?.price_money
                );

                if (!validVariation) {
                    console.warn(`Item ${item.id} has no valid price information.`);
                    return null;
                }

                return {
                    upc: item.id,
                    name: item.item_data.name || "Unnamed Product",
                    description: item.item_data.description || "No description available",
                    price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                    category: categories[item.item_data.category_id] || "Unknown Category", // ✅ Map category name
                    date: item.item_data.updated_at,
                    vendor: validVariation.item_variation_data.vendor_id || "Unknown Vendor", // ✅ Ensure vendor exists
                    image_url: item.item_data.image_ids?.length
                        ? `https://connect.squareup.com/v2/catalog/object/${item.item_data.image_ids[0]}`
                        : 'https://via.placeholder.com/150' // ✅ Handle missing images
                };
            })
            .filter(item => item !== null); // Remove null items

        // Sort products by name
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
