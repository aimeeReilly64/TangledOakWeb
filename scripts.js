const API_BASE_URL = "https://your-backend-url.com"; // Update this with your actual API URL

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const { productsByCategory, productsByVendor } = await response.json();

        displayProductsByCategory(productsByCategory);
        displayProductsByVendor(productsByVendor);
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