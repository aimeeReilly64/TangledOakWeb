const API_URL = "https://tangledoakweb.onrender.com/products"; // Change if needed

async function fetchProducts() {
    console.log("🔎 Fetching products...");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Data received:", data);  // Logs the full response for debugging

        if (!data.products || data.products.length === 0) {
            console.warn("⚠️ No products found.");
            return;
        }

        displayNewestProducts(data.products);
    } catch (error) {
        console.error("🚨 Error fetching products:", error);
    }
}

function displayNewestProducts(products) {
    const productsContainer = document.getElementById("products-container");

    if (!productsContainer) {
        console.error("❌ ERROR: Missing #products-container in the HTML.");
        return;
    }

    productsContainer.innerHTML = ""; // Clear previous content

    products.slice(0, 3).forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <a href="${product.ecomUri || "#"}">
                <img src="${product.imageUrl || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)} ${product.currency}</p>
                <p class="product-description">${product.description || "No description available."}</p>
                <p class="product-vendor"><strong>Vendor:</strong> ${product.vendorId}</p>
                <button class="button">View Product</button>
            </a>
        `;

        productsContainer.appendChild(productCard);
    });
}

// Ensure script runs after the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

