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


                // Map image IDs to URLs
                const imageMap = {};
                const categoryMap = {};
                const vendorMap = {};

                data.objects.forEach(obj => {
                    if (obj.type === "IMAGE" && obj.image_data) {
                        imageMap[obj.id] = obj.image_data.url;
                    } else if (obj.type === "CATEGORY" && obj.category_data) {
                        categoryMap[obj.id] = obj.category_data.name;
                    } else if (obj.type === "VENDOR" && obj.vendor_data) {
                        vendorMap[obj.id] = obj.vendor_data.name;
                    }
                });

                // Extract relevant product details
                const formattedProducts = data.objects
                    .filter(item => item.type === "ITEM") // Only process items, not categories or images
                    .map(item => {
                        if (!item.item_data || !Array.isArray(item.item_data.variations) || item.item_data.variations.length === 0) {
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

                        // Get first valid image
                        const imageUrl = item.item_data.image_ids?.[0] ? imageMap[item.item_data.image_ids[0]] : null;

                        // Resolve category and vendor names
                        const categoryName = item.item_data.category_id ? categoryMap[item.item_data.category_id] || "Uncategorized" : "Uncategorized";
                        const vendorName = item.item_data.vendor_ids?.[0] ? vendorMap[item.item_data.vendor_ids[0]] || "Unknown Vendor" : "Unknown Vendor";

                        return {
                            upc: item.id,
                            name: item.item_data.name,
                            description: item.item_data.description || "No description available",
                            price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                            date: item.item_data.updated_at,
                            category: categoryName,
                            vendor: vendorName,
                            image_url: imageUrl || "https://via.placeholder.com/150", // Fallback image
                        };
                    })
                    .filter(item => item !== null); // Remove null items

                // Sort products by name in ascending order
                formattedProducts.sort((a, b) => a.name.localeCompare(b.name));

                res.json(formattedProducts);
            } catch (error) {
                console.error('Error fetching products:', error.message);
                res.status(500).json({ message: 'Error fetching products' });
            }
        });
