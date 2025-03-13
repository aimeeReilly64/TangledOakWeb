const API_BASE_URL = "https://tangledoakweb.onrender.com/products";

async function fetchProducts() {
    try {
        const response = await fetch(API_BASE_URL); //
         if (!response.ok) throw new Error(`Failed to fetch products. Status: ${response.status}`);
        const data = await response.json();
        const productsByCategory = groupBy(data.products, "category");
        const productsByVendor = groupBy(data.products, "vendor");
        displayProductsByCategory(productsByCategory);
        displayProductsByVendor(productsByVendor);
            // Display products in a grid layout
        displayProductsInGrid(data.products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

async function fetchProductsByCategory(category) {
    try {
        const response = await fetch(API_BASE_URL); //
        if (!response.ok) throw new Error(`Failed to fetch products. Status: ${response.status}`);
        const data = await response.json();
        const products = data.products.filter(product => product.category === category);
        displayProductsByCategory({ [category]: products });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

function displayProductsByCategory(productsByCategory) {
    const categoriesContainer = document.getElementById("categories-container");
    categoriesContainer.innerHTML = '';

    Object.keys(productsByCategory).forEach(category => {
        const categorySection = document.createElement("div");
        categorySection.classList.add("category-section");
        categorySection.innerHTML = `
            <h2>${category}</h2>
            <div class="product-list">
                ${productsByCategory[category].map(product => `
                    <div class="product-card">
                        <img src="${product.image_url}" alt="${product.name}" class="product-image">
                        <h3>${product.name}</h3>
                        <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                `).join('')}
            </div>
        `;
        categoriesContainer.appendChild(categorySection);
    });
}

function displayProductsByVendor(productsByVendor) {
    const vendorsContainer = document.getElementById("vendors-container");
    vendorsContainer.innerHTML = '';

    Object.keys(productsByVendor).forEach(vendor => {
        const vendorSection = document.createElement("div");
        vendorSection.classList.add("vendor-section");

        vendorSection.innerHTML = `
            <h2>${vendor}</h2>
            <div class="product-list">
                ${productsByVendor[vendor].map(product => `
                    <div class="product-card">
                        <img src="${product.image_url}" alt="${product.name}" class="product-image">
                        <h3>${product.name}</h3>
                        <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                `).join('')}
            </div>
        `;
        vendorsContainer.appendChild(vendorSection);
    });
}
function displayNewProduct(product) {}

function displayProductsInGrid(products) {
    const productsContainer = document.getElementById("products-container");
    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        productsContainer.appendChild(productCard);
    });
}

fetchProducts();
document.addEventListener("click", event => {
    if (event.target.classList.contains("category-link")) {
        const category = event.target.textContent;
        fetchProductsByCategory(category);
    }   else {
        const vendor = event.target.textContent;
        fetchProductsByVendor(vendor);  // fetch products by vendor and display them in the vendors-container  //
    }
});

function redirectToSquareCheckout(productId) {
    window.location.href = `https://squareup.com/checkout?product=${productId}`;
}