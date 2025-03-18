const API_URL = "https://tangledoakweb.onrender.com/products"; // Change if needed
// Fetch Categories and Display in Sidebar
async function fetchCategories() {
    console.log("🔎 Fetching categories...");

    const categoriesList = document.getElementById("categories-list");
    if (!categoriesList) {
        console.warn("⚠️ Skipping categories: #categories-list is missing.");
        return;
    }

    try {
        const response = await fetch('/categories');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const categories = await response.json();

        categoriesList.innerHTML = ''; // Clear existing categories

        categories.forEach(category => {
            const categorySlug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const categoryUrl = `https://the-tangled-oak-craft-collective.square.site/shop/${categorySlug}/${category.id}`;
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = categoryUrl;
            link.textContent = category.name;
            listItem.appendChild(link);
            categoriesList.appendChild(listItem);
        });

        console.log("✅ Categories loaded successfully.");
    } catch (error) {
        console.error("🚨 Error fetching categories:", error);
        categoriesList.innerHTML = 'Failed to load categories.';
    }
}

// Initialize Event Listeners and Fetch Data
document.addEventListener("DOMContentLoaded", () => {
    // Existing initialization code...

    fetchCategories(); // Fetch and display categories
});
