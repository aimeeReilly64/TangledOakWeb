const API_URL = "https://tangledoakweb.onrender.com/products"; // Change if needed

// Pagination Variables
let products = [];
let currentPage = 1;
const productsPerPage = 6;

// Vendor Names Mapping
const VENDOR_NAMES = {
    "6ITGGUAU4WFNODHC": "Bohemian Heart Crafts",
    "PRXTSMGSCHHM4VRY": "Candy Dandy Crafts",
    "WLW2NWHJYTWCYS4": "Knit with Love by Carol",
    "77ZZ63H2LQYHK72L": "Ocean Soul Clay",
    "PNBDSFW5JXMK3Y4G": "DIY",
    "D4UWK3EJ3HNBXF4C": "Peddie Pieces",
    "TBHP56ZWF4T5NLQ6": "Mo's Craftworks",
    "WQSD7V2F6OWOBQGR": "The Knotty Celt",
    "C5EH3KNZGT5UKOZA": "Tags & Tropics",
    "ZYSJENBBVMP4RZQW": "A&S Crystals"
};

// Populate Vendor Filter Dropdown
function populateVendorFilter() {
    console.log("🔎 Populating vendor filter...");

    const vendorSelect = document.getElementById("vendor-select");
    if (!vendorSelect) {
        console.warn("⚠️ Skipping vendor filter: #vendor-select is missing.");
        return;
    }

    if (!products || products.length === 0) {
        console.warn("⚠️ No products found, skipping vendor filter population.");
        return;
    }

    const uniqueVendors = [...new Set(products.map(product => product.vendorId))];

    vendorSelect.innerHTML = `<option value="all">All Vendors</option>`;
    uniqueVendors.forEach(vendorId => {
        const vendorName = VENDOR_NAMES[vendorId] || `Unknown Vendor (${vendorId})`;
        const option = document.createElement("option");
        option.value = vendorId;
        option.textContent = vendorName;
        vendorSelect.appendChild(option);
    });

    console.log("✅ Vendor filter populated successfully.");
}

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

        // Populate the vendor filter only if products exist
        if (products.length > 0) {
            populateVendorFilter();
        }

        displayProducts();
    } catch (error) {
        console.error("🚨 Error fetching products:", error);
    }
}

// Fetch Categories (Placeholder)
async function fetchCategories() {
    console.log("🔎 Fetching categories...");

    const categoriesContainer = document.getElementById("categories-container");
    if (!categoriesContainer) {
        console.warn("⚠️ Skipping categories: #categories-container is missing.");
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
        console.warn("⚠️ Skipping product display: #products-container is missing.");
        return;
    }

    const sortSelect = document.getElementById("sort-select");
    const vendorSelect = document.getElementById("vendor-select");

    let sortOption = sortSelect ? sortSelect.value : "newest";
    let vendorFilter = vendorSelect ? vendorSelect.value : "all";

    let sortedProducts = [...products];

    // Apply Sorting
    if (sortOption === "price-low-high") {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high-low") {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === "newest") {
        sortedProducts.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    // Apply Vendor Filter
    if (vendorFilter !== "all") {
        sortedProducts = sortedProducts.filter(product => product.vendorId === vendorFilter);
    }

    // Apply Pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    // Display Products
    productsContainer.innerHTML = paginatedProducts.map(product => `
        <div class="product-card">
            <a href="${product.ecomUri || "#"}">
                <img src="${product.imageUrl || 'placeholder.jpg'}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || "No description available."}</p>
                <p class="product-vendor"><strong>Vendor:</strong> ${VENDOR_NAMES[product.vendorId] || `Unknown Vendor (${product.vendorId})`}</p>
                <button class="button">View Product</button>
            </a>
        </div>
    `).join("");

    updatePaginationControls(sortedProducts.length);
}

// Pagination Controls
function updatePaginationControls(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginationContainer = document.getElementById("pagination-controls");
    if (!paginationContainer) return;

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

// Initialize Dropdown Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".category-dropdown > a").forEach(category => {
        category.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent page refresh
            category.parentElement.classList.toggle("active"); // Toggle visibility
        });
    });

    const sortSelect = document.getElementById("sort-select");
    const vendorSelect = document.getElementById("vendor-select");

    if (sortSelect) {
        sortSelect.addEventListener("change", displayProducts);
    } else {
        console.warn("⚠️ #sort-select is missing.");
    }

    if (vendorSelect) {
        vendorSelect.addEventListener("change", displayProducts);
    } else {
        console.warn("⚠️ #vendor-select is missing.");
    }

    fetchProducts(); // Fetch and populate products/vendors
    fetchCategories();
});
