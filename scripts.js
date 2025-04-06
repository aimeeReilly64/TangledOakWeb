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

function sortProducts(products) {
    products.sort((a, b) => {
        const sorted = products.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return  sorted
    });
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
try{
    sortProducts(products);
}
catch(error){
    console.error('Error sorting products:', error);
    container.innerHTML = '<p>���️ Failed to sort products. Please try again later.</p>';
}
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
            <h2 class="product-title">${product.name || 'Unnamed Product'}</h2>
            <p class="product-description">${product.description || 'No description available.'}</p>
            <p class="product-price"><strong>Price:</strong> ${price}</p>
            <a href="${product.product_url}" class="button" target="_blank">View</a>
        `;
        container.appendChild(productElement);
    });
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
});

function createLeaf() {
    const leafContainer = document.getElementById('leaf-container');
    const leafImages = [
        'views/images/leaf1.png',
        'views/images/leaf2.png',
        'views/images/leaf3.png',
        'views/images/leaf4.png',
        'views/images/leaf5.png',
        'views/images/leaf6.png' ,
        'views/images/leaf7.png',
        'views/images/leaf8.png',
        'views/images/leaf9.png',
        'views/images/leaf10.png'
    ];

    const leaf = document.createElement('img');
    leaf.src = leafImages[Math.floor(Math.random() * leafImages.length)];
    leaf.classList.add('leaf');

    // Random horizontal position
    leaf.style.left = `${Math.random() * 100}vw`;

    // Random animation duration and delay
    leaf.style.animationDuration = `${8 + Math.random() * 5}s, ${3 + Math.random() * 2}s`;
    leaf.style.animationDelay = `${Math.random() * 5}s`;
    leafContainer.appendChild(leaf);
    leaf.addEventListener('animationend', () => {
        leaf.classList.remove('falling');
    });
// Optionally generate the first one immediately
    createLeaf();
}

// Remove the
