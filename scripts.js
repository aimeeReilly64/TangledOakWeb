const API_BASE_URL = "https://tangledoakweb.onrender.com/products";

async function fetchProducts() {
    try {
        const response = await fetch(API_BASE_URL); //
         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        displayProducts(data.products);
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
function displayProducts(products) {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) {
        console.error("❌ ERROR: Missing #products-container in Shop.html");
        return;
    }

    productsContainer.innerHTML = ""; // Clear existing content

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <a href="${product.ecomUri}" target="_blank">
                <img src="${product.imageUrl || 'default.jpg'}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)} ${product.currency}</p>
                <button class="button">View Product</button>
            </a>
        `;

        productsContainer.appendChild(productCard);
    });
}

fetchProducts();

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("add-to-cart")) {
        const productId = event.target.dataset.id;
        redirectToSquareCheckout(productId);
    }
});

function redirectToSquareCheckout(productId) {
    window.location.href = `https://squareup.com/checkout?product=${productId}`;
}