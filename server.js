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
        method: "GET",  // ✅ Square API requires GET, not POST
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

/** Fetch Images */
const fetchImages = async () => {
    const response = await fetch(SQUARE_API_URL, {
        method: "GET",  // ✅ Square API requires GET
        headers: {
            "Square-Version": "2025-02-20",
            "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    if (!data.objects) return {}; // Return empty if no images exist

    return data.objects.reduce((map, obj) => {
        if (obj.type === "IMAGE" && obj.image_data) {
            map[obj.id] = obj.image_data.url; // ✅ Store image ID → URL
        }
        return map;
    }, {});
};

/** Fetch Products */
app.get('/products', async (req, res) => {
    try {
        const [categoryMap, imageMap] = await Promise.all([
            fetchCategories(),
            fetchImages()
        ]);

        const response = await fetch(SQUARE_API_URL, {
            method: "GET",
            headers: {
                "Square-Version": "2025-02-20",
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (!data.objects) throw new Error("Invalid product data format from Square API");

        const products = data.objects
            .filter(item => item.type === "ITEM") // ✅ Only process items
            .map(item => {
                if (!item.item_data || !item.item_data.variations || item.item_data.variations.length === 0) {
                    console.warn(`Item ${item.id} is missing variations.`);
                    return null; // Skip items without variations
                }

                // Get first variation with price
                const validVariation = item.item_data.variations.find(
                    variation => variation.item_variation_data && variation.item_variation_data.price_money
                );

                if (!validVariation) {
                    console.warn(`Item ${item.id} has no valid price.`);
                    return null;
                }

                // Get image URL (if exists)
                const imageUrl = item.item_data.image_ids?.[0] ? imageMap[item.item_data.image_ids[0]] : null;

                // Get category name
                const categoryName = item.item_data.category_id
                    ? categoryMap[item.item_data.category_id] || "Uncategorized"
                    : "Uncategorized";

                return {
                    upc: item.id,
                    name: item.item_data.name,
                    description: item.item_data.description || "No description available",
                    price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                    category: categoryName,
                    image_url: imageUrl || "https://placehold.co/150", // ✅ Fallback image
                };
            })
            .filter(item => item !== null); // Remove null items

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

/** Start the Server */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
