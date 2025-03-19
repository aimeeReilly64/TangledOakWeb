const API_URL = "https://tangledoakweb.onrender.com/products";

async function fetchProducts() {
    try {
        const response = await fetch('/products');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();
        const container = document.getElementById('products-container');
        container.innerHTML = ''; // Clear existing content
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';
            productElement.innerHTML = `
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p>Price: $${product.price}</p>
                <p>Category: ${product.category}</p>
                <p>Vendor: ${product.vendor}</p>
            `;
            container.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

