const API_URL = "https://tangledoakweb.onrender.com/products";
let cachedProducts = [];

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();
        cachedProducts = products;
        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-container').innerHTML =
            '<p>⚠️ Failed to load products. Please try again later.</p>';
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (!products.length) {
        container.innerHTML = '<p>No products available at the moment.</p>';
        return;
    }

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';

        const price = typeof product.price === 'number'
            ? `$${product.price.toFixed(2)} ${product.currency || ''}`.trim()
            : 'N/A';

        const updatedDate = product.updated_at
            ? new Date(product.updated_at).toLocaleString()
            : 'Unknown';

        productElement.innerHTML = `
            <img src="${product.image_url}" alt="${product.name || 'Product Image'}" class="product-image" />
            <h2>${product.name || 'Unnamed Product'}</h2>
            <p>${product.description || 'No description available.'}</p>
            <p><strong>Price:</strong> ${price}</p>
            <a href="${product.product_url}" class="product-link" target="_blank">View</a>
        `;

        container.appendChild(productElement);
    });
}

function searchProducts(query) {
    const filtered = cachedProducts.filter(product =>
        (product.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(query.toLowerCase())
    );

    renderProducts(filtered);
}

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const isVisible = sidebar.style.display === "block";
    sidebar.style.display = isVisible ? "none" : "block";
    sidebar.classList.toggle('hidden');
    sidebar.classList.toggle('visible');

    // Accessibility toggle
    const hamburger = document.getElementById("hamburger-menu");
    if (hamburger) {
        hamburger.setAttribute("aria-expanded", !isVisible);
    }
}

// Sidebar hover behavior (desktop)
document.querySelectorAll(".side-nav-small").forEach(item => {
    item.addEventListener("mouseenter", () => {
        const submenu = item.querySelector(".side-nav-smaller");
        if (submenu) submenu.style.display = "block";
    });

    item.addEventListener("mouseleave", () => {
        const submenu = item.querySelector(".side-nav-smaller");
        if (submenu) submenu.style.display = "none";
    });
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                searchProducts(query);
            } else {
                renderProducts(cachedProducts); // Reset view if cleared
            }
        });
    }
});

