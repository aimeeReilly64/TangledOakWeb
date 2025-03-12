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

        if (!data.objects || !Array.isArray(data.objects)) {
            throw new Error("Invalid Square API response structure.");
        }

        // Organize products by category and vendor
        const productsByCategory = {};
        const productsByVendor = {};

        data.objects.forEach(product => {
            if (product && product.category_id) {
                if (!productsByCategory[product.category_id]) {
                    productsByCategory[product.category_id] = [];
                }
                productsByCategory[product.category_id].push(product);
            }

            if (product && product.vendor) {
                if (!productsByVendor[product.vendor]) {
                    productsByVendor[product.vendor] = [];
                }
                productsByVendor[product.vendor].push(product);
            }
        });

        res.json({ productsByCategory, productsByVendor });
    } catch (error) {
        console.error("🚨 Error fetching products:", error.message);
        res.status(500).json({ error: "Failed to fetch products." });
    }
});
