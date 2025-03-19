require('dotenv').config();
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
        const formattedProducts = data.objects;
        const itemDetails = item.item_data;

        formattedProducts.forEach(item => {
                item = {
                    upc: item.id,
                    name: item.item_data.name,
                    description: item.item_data.description,
                    price: itemDetails.variations[0].price_money.amount / 100 , // Convert cents to dollars
                    vendor: itemDetails.vendor_ids  ||
                        `Vendor with ID ${itemDetails.vendor_ids[0]}` ,// Default to vendor ID if none provided
                    category: itemDetails.category_ids ||
                        `Category with ID ${itemDetails.category_ids[0]}` // Default to category ID if none provided
                };

            });
         // Sort products by name in ascending order
        formattedProducts.sort((a, b) => a.name.localeCompare(b.name));
        res.json(formattedProducts);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Error fetching products' });
    }

})
