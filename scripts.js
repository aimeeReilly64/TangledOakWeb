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
            const price = typeof product.price === 'number' ? `$${product.price.toFixed(2)} ${product.currency}` : 'N/A';

            // Format updated date
            const updatedDate = product.updated_at ? new Date(product.updated_at).toLocaleString() : 'Unknown';

            // Create product elements
            const img = document.createElement('img');
            img.src = product.image_url;
            img.alt = product.name || 'Product Image';
            img.className = "product-image"; // Styling via CSS

            const name = document.createElement('h2');
            name.textContent = product.name || 'Unnamed Product';

            const description = document.createElement('p');
            description.textContent = product.description || 'No description available.';

            const priceInfo = document.createElement('p');
            priceInfo.innerHTML = `<strong>Price:</strong> ${price}`;

            const updatedInfo = document.createElement('p');
            updatedInfo.innerHTML = `<strong>Last Updated:</strong> ${updatedDate}`;

            // Link to product page
            const productLink = document.createElement('a');
            productLink.href = product.product_url;
            productLink.textContent = "View Product";
            productLink.target = "_blank";
            productLink.className = "product-link";

            // Append elements to product div
            productElement.appendChild(img);
            productElement.appendChild(name);
            productElement.appendChild(description);
            productElement.appendChild(priceInfo);
            productElement.appendChild(updatedInfo);
            productElement.appendChild(productLink);

            // Append product to container
            container.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('products-container').innerHTML =
            '<p>⚠️ Failed to load products. Please try again later.</p>';
    }
}
document.querySelectorAll(".side-nav-small").forEach((item) => {
    item.addEventListener("mouseenter", () => {
        let submenu = item.querySelector(".side-nav-smaller");
        if (submenu) submenu.style.display = "block";
    });

    item.addEventListener("mouseleave", () => {
        let submenu = item.querySelector(".side-nav-smaller");
        if (submenu) submenu.style.display = "none";
    });
});
async function searchProducts(query) {
    const response = await fetch(API_URL);
    const products = await response.json();

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );

    displaySearchResults(filtered);
}

function displaySearchResults(results) {
    const container = document.getElementById("products-container");
    container.innerHTML = "";

    if (results.length === 0) {
        container.innerHTML = "<p>No products found.</p>";
        return;
    }

    results.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>$${product.price.toFixed(2)}</p>
        `;
        container.appendChild(card);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                searchProducts(query);
            }
        });
    }
});
