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
const SQUARE_API_VERSION = "2025-02-20"; // Ensure this matches the current API version

/** Fetch Images by Image ID */
async function fetchImages(imageIds) {
    if (!imageIds.length) return {};

    const response = await fetch(SQUARE_API_URL, {
        method: "GET",
        headers: {
            "Square-Version": SQUARE_API_VERSION,
            "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        console.error("Failed to fetch images from Square.");
        return {};
    }

    const data = await response.json();
    const images = {};

    if (data.objects) {
        data.objects.forEach(obj => {
            if (obj.type === "IMAGE" && obj.image_data) {
                images[obj.id] = obj.image_data.url;
            }
        });
    }

    return images;
}

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

        // Collect all image IDs
        const imageIds = [];
        data.objects.forEach(item => {
            if (item.type === "ITEM" && item.item_data?.image_ids) {
                imageIds.push(...item.item_data.image_ids);
            }
            if (item.item_data?.variations) {
                item.item_data.variations.forEach(variation => {
                    if (variation.item_variation_data?.image_ids) {
                        imageIds.push(...variation.item_variation_data.image_ids);
                    }
                });
            }
        });

        // Fetch all images
        const images = await fetchImages(imageIds);

        // Extract and format product details
        const formattedProducts = data.objects
            .filter(item => item.type === "ITEM" && item.item_data)
            .map(item => {
                const validVariation = item.item_data.variations?.find(
                    variation => variation.item_variation_data?.price_money
                );
                if (!validVariation) {
                    console.warn(`Item ${item.id} has no valid price information.`);
                    return null;
                }

                // Determine image URL
                let imageUrl = 'https://via.placeholder.com/150'; // Default placeholder
                if (item.item_data.image_ids?.length) {
                    imageUrl = images[item.item_data.image_ids[0]] || imageUrl;
                } else if (validVariation.item_variation_data.image_ids?.length) {
                    imageUrl = images[validVariation.item_variation_data.image_ids[0]] || imageUrl;
                }

                return {
                    upc: item.id,
                    name: item.item_data.name || "Unnamed Product",
                    description: item.item_data.description || "No description available",
                    price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                    updated_at: item.item_data.updated_at || "Unknown",
                    image_url: imageUrl
                };
            })
            .filter(item => item !== null) // Remove null items
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // Sort by last updated

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
