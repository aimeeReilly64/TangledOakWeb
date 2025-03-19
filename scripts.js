const API_URL = "https://tangledoakweb.onrender.com/products";

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();
        const container = document.getElementById('products-container');
        container.innerHTML = ''; // Clear existing content

        if (!products.length) {
            container.innerHTML = '<p>No products available at the moment.</p>';
            return;
        }

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';

            // Ensure price is valid
            const price = typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A';
            const name = document.createElement('h2');
            name.textContent = product.name || 'Unnamed Product';

            const description = document.createElement('p');
            description.textContent = product.description || 'No description available.';

            const priceInfo = document.createElement('p');
            priceInfo.innerHTML = `<strong>Price:</strong> $${price}`;
            const img = document.createElement('img');

            // Append elements to product div
            productElement.appendChild(img);
            productElement.appendChild(name);
            productElement.appendChild(description);
            productElement.appendChild(priceInfo);
            // Append product to container
            container.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-container').innerHTML =
            '<p>⚠️ Failed to load products. Please try again later.</p>';
    }
}

// Ensure fetch is called when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", fetchProducts);
