const API_BASE_URL = "https://tangledoakweb.onrender.com/products";

// Ensure the API endpoint is correct
const API_URL = "http://localhost:3000/products"; // Change this if hosted

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            console.error("No products received from API.");
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
                <button class="button">View Product</button>
            </a>
        `;

        productsContainer.appendChild(productCard);
    });
}
async function fetchVendors() {
    console.log("🔎 Fetching vendors...");

    try {
        const response = await fetch("https://tangledoakweb.onrender.com/vendors"); // Update if needed
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Vendors fetched:", data);

        displayVendors(data.vendors);
    } catch (error) {
        console.error("🚨 Error fetching vendors:", error);
    }
}

function displayVendors(vendors) {
    const vendorsContainer = document.getElementById("vendors-container");
    if (!vendorsContainer) {
        console.error("❌ ERROR: Missing #vendors-container in the HTML.");
        return;
    }

    vendorsContainer.innerHTML = vendors.map(vendor => `<p>${vendor.name}</p>`).join("");
}

// Ensure vendors are fetched when page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchVendors();
});

function groupBy(array, key) {
    return array.reduce((result, obj) => {
        (result[obj[key]] = result[obj[key]] || []).push(obj);
        return result;
    }, {});
}


// Ensure script runs after the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});
