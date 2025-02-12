

// Toggle navigation menu on hamburger click    event listener

document.getElementById('hamburger').addEventListener('click', function() {
    document.getElementById('nav-links').classList.toggle('active');
});

// Smooth scrolling on navigation links click

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const offsetTop = document.querySelector(href).offsetTop;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    });
});

// Display search results dynamically

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const products = [
        { name: 'Product 1', category: 'Category A' },
        { name: 'Product 2', category: 'Category B' },
        { name: 'Product 3', category: 'Category C' },
        { name: 'Product 4', category: 'Category D' }
    ];
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm));
    searchResults.innerHTML = '';
    filteredProducts.forEach(product => {
        const li = document.createElement('li');
        li.textContent = product.name;
        searchResults.appendChild(li);
    });
});

