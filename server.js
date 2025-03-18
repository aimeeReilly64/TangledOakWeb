require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_API_URL = 'https://connect.squareup.com/v2/catalog/list?types=CATEGORY';

app.get('/categories', async (req, res) => {
    try {
        const response = await fetch(SQUARE_API_URL, {
            method: 'GET',
            headers: {
                'Square-Version': '2025-02-20',
                'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Square API error! Status: ${response.status}`);
        }

        const data = await response.json();
        const categories = data.objects.map(category => ({
            id: category.id,
            name: category.category_data.name
        }));

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
