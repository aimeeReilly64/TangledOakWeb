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

/** Fetch Categories */
const fetchCategories = async () => {
    try {
        const response = await fetch(SQUARE_API_URL, {
            method: "GET",
            headers: {
                "Square-Version": SQUARE_API_VERSION,
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

/** Fetch Vendors */
const fetchVendors = async () => {
    try {
        const response = await fetch("https://connect.squareup.com/v2/vendors/search", {
            method: "POST",
            headers: {
                "Square-Version": SQUARE_API_VERSION,
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });

        const data = await response.json();
        if (!data.vendors) return {};

        return data.vendors.reduce((map, vendor) => {
            map[vendor.id] = vendor.name;
            return map;
        }, {});
    } catch (error) {
        console.error('Error fetching vendors:', error.message);
        return {};
    }
};

/** Fetch Images */
const fetchImages = async (imageIds) => {
    try {
        const response = await fetch("https://connect.squareup.com/v2/catalog/batch-retrieve", {
            method: "POST",
            headers: {
                "Square-Version": SQUARE_API_VERSION,
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ object_ids: imageIds })
        });

        const data = await response.json();
        if (!data.objects) return {};

        return data.objects.reduce((map, obj) => {
            if (obj.type === "IMAGE" && obj.image_data) {
                map[obj.id] = obj.image_data.url;
            }
            return map;
        }, {});
    } catch (error) {
        console.error('Error fetching images:', error.message);
        return {};
    }
};

/** Fetch Products */
app.get('/products', async (req, res) => {
    try {
        // Fetch categories and vendors
        const [categories, vendors] = await Promise.all([fetchCategories(), fetchVendors()]);

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
            if (item.type === "ITEM" && item.item_data) {
                if (item.item_data.image_ids) {
                    imageIds.push(...item.item_data.image_ids);
                }
                if (item.item_data.variations) {
                    item.item_data.variations.forEach(variation => {
                        if (variation.item_variation_data.image_ids) {
                            imageIds.push(...variation.item_variation_data.image_ids);
                        }
                    });
                }
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
                if (item.item_data.image_ids && item.item_data.image_ids.length > 0) {
                    imageUrl = images[item.item_data.image_ids[0]] || imageUrl;
                } else if (validVariation.item_variation_data.image_ids && validVariation.item_variation_data.image_ids.length > 0) {
                    imageUrl = images[validVariation.item_variation_data.image_ids[0]] || imageUrl;
                }

                return {
                    upc: item.id,
                    name: item.item_data.name || "Unnamed Product",
                    description: item.item_data.description || "No description available",
                    price: validVariation.item_variation_data.price_money.amount / 100, // Convert cents to dollars
                    category: categories[item.item_data.category_id] || "Unknown Category",
                    date: item.item_data.updated_at,
                    vendor: vendors[validVariation.item_variation_data.vendor_id] || "Unknown Vendor",
                    image_url: imageUrl
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

