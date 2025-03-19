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

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';

            // Ensure image_url exists
            const imageUrl = product.image_url ? product.image_url : 'https://via.placeholder.com/150';

            productElement.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Vendor:</strong> ${product.vendor}</p>
            `;

            container.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-container').innerHTML =
            '<p>Failed to load products. Please try again later.</p>';
    }
}
