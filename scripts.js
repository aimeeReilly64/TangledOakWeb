const API_URL = "https://tangledoakweb.onrender.com/products"; // Change if needed

// Pagination Variables
let products = [];
let currentPage = 1;
const productsPerPage = 6;

// Fetch Products from API
async function fetchProducts() {
    console.log("🔎 Fetching products...");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Data received:", data);

        if (!data.products || data.products.length === 0) {
            console.warn("⚠️ No products found.");
            return;
        }

        products = data.products;
        populateVendorFilter();
        displayProducts();
    } catch (error) {
        console.error("🚨 Error fetching products:", error);
    }
}

// Fetch Vendors and Populate Vendor Dropdown
async function fetchVendors() {
    console.log("🔎 Fetching vendors...");
    try {
        const response = await fetch(API_URL); // Same API, as vendors are inside product data
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.products) return;

        const uniqueVendors = [...new Set(data.products.map(product => product.vendorId))];

        const vendorSelect = document.getElementById("vendor-select");
        if (!vendorSelect) {
            console.error("❌ ERROR: Missing #vendor-select in the HTML.");
            return;
        }

        vendorSelect.innerHTML = `<option value="all">All Vendors</option>`;
        uniqueVendors.forEach(vendor => {
            const option = document.createElement("option");
            option.value = vendor;
            option.textContent = vendor;
            vendorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("🚨 Error fetching vendors:", error);
    }
}

// Fetch Categories (Placeholder)
async function fetchCategories() {
    console.log("🔎 Fetching categories...");

    const categoriesContainer = document.getElementById("categories-container");
    if (!categoriesContainer) {
        console.error("❌ ERROR: Missing #categories-container in the HTML.");
        return;
    }

    // Placeholder categories - Replace with actual API if needed
    const categories = ["Jewelry", "Home Decor", "Accessories", "Clothing", "Pottery"];

    categoriesContainer.innerHTML = categories.map(category => `
        <button class="category-button" onclick="filterByCategory('${category}')">${category}</button>
    `).join("");
}

// Display Products with Pagination
function displayProducts() {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) {
        console.error("❌ ERROR: Missing #products-container in the HTML.");
        return;
    }

    productsContainer.innerHTML = ""; // Clear previous content

    // Apply sorting
    const sortOption = document.getElementById("sort-select").value;
    let sortedProducts = [...products];

    if (sortOption === "price-low-high") {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high-low") {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === "newest") {
        sortedProducts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    // Apply Vendor Filter
    const vendorFilter = document.getElementById("vendor-select").value;
    if (vendorFilter !== "all") {
        sortedProducts = sortedProducts.filter(product => product.vendorId === vendorFilter);
    }

    // Pagination Logic
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    // Display Products
    paginatedProducts.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        let variationsHTML = product.variations.map(variation => `
            <p class="product-variation">
                <strong>${variation.name}:</strong> $${variation.price.toFixed(2)} ${variation.currency}
            </p>
        `).join("");

        productCard.innerHTML = `
            <a href="${product.ecomUri || "#"}">
                <img src="${product.imageUrl || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || "No description available."}</p>
                <div class="product-variations">${variationsHTML}</div>
                <p class="product-vendor"><strong>Vendor:</strong> ${product.vendorId}</p>
                <button class="button">View Product</button>
            </a>
        `;

        productsContainer.appendChild(productCard);
    });

    updatePaginationControls(sortedProducts.length);
}

// Pagination Controls
function updatePaginationControls(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginationContainer = document.getElementById("pagination-controls");
    paginationContainer.innerHTML = ""; // Clear old controls

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.classList.add("pagination-button");
        if (i === currentPage) {
            button.classList.add("active");
        }
        button.addEventListener("click", () => {
            currentPage = i;
            displayProducts();
        });
        paginationContainer.appendChild(button);
    }
}

// Filter by Category (Mock function)
function filterByCategory(category) {
    alert(`Filtering by category: ${category}`);
    // Implement filtering logic if categories are fetched dynamically
}

// Event Listeners
document.getElementById("sort-select").addEventListener("change", displayProducts);
document.getElementById("vendor-select").addEventListener("change", displayProducts);

// Ensure script runs after the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    fetchVendors();
    fetchCategories();
});
