const API_URL = "https://tangledoakweb.onrender.com/products"; // Change if needed
// Fetch Categories and Display in Sidebar
async function fetchProducts() {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(data);
}


// Initialize Event Listeners and Fetch Data
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(); // Fetch and display categories
});
