const API_URL = "https://tangledoakweb.onrender.com/products";

async function fetchProducts() {
    try {
        const response = await fetch('/products');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Process and display the data
    } catch (error) {
        console.error('Error fetching products:', error);
        // Display a user-friendly message on the webpage
        const container = document.getElementById('products-container');
        container.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

