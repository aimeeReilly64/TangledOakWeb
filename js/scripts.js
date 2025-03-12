// ==========================
// Toggle Sidebar on Hamburger Click
// ==========================
const hamburgerMenu = document.getElementById('hamburger-menu');
const sidebar = document.querySelector('.sidebar');

if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

// ==========================
// Smooth Scrolling for Navigation Links
// ==========================
document.querySelectorAll('.nav-link, .side-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = link.getAttribute('href');

        if (href.startsWith("#") || (href.includes(".html") && !href.includes("http"))) {
            e.preventDefault();
            const section = document.querySelector(href);

            if (section) {
                window.scrollTo({
                    top: section.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==========================
//  Search Bar Functionality
// ==========================
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';

        if (searchTerm.length > 0) {
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );

            if (filteredProducts.length > 0) {
                searchResults.style.display = 'block';
                filteredProducts.forEach(product => {
                    const li = document.createElement('li');
                    li.textContent = product.name;
                    li.onclick = function() {
                        window.location.href = product.link;
                    };
                    searchResults.appendChild(li);
                });
            } else {
                searchResults.style.display = 'none';
            }
        } else {
            searchResults.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}
async function fetchProducts() {
    try {
        const response = await fetch("http://localhost:3000/products");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        displayNewestProducts(data.objects);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
function vendorName(product) {
    return product.vendor;

    // Add more vendor names as needed
    // Example:
    // if (product.vendor === "Vendor 1") {
    //     return "Vendor 1";
    // } else if (product.vendor === "Vendor 2") {
    //     return "Vendor 2";
    // } else if (product.vendor === "Vendor 3") {
    //     return "Vendor 3";
    // }
    // return "Unknown";
}
function displayNewestProducts(products) {
    const productsContainer = document.getElementById("products-container");
    if (!productsContainer) {
        console.error("ERROR: Missing #products-container in Shop.html");
        return;
    }

    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    products = products.slice(0, 3);
    productsContainer.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
                <a href="${product.link}">
                    <img src="${product.image_url}" alt="${product.name}" class="product-image">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                    <p class="product-description">${product.description}</p>
                    <button class="button">View Product</button>
                </a>
            `;
        productsContainer.appendChild(productCard);
    });
}

fetchProducts();



// ==========================