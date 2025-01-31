//this is connecting to the square api server

const accessToken = "EAAAlw_UirsbUjXw7cB1VR0t-wbasHP9OnXevEmRZUWp_nWvL-ZyRn020T1yaN5E";  // Replace with your token
const locationId = "main";  // Replace with your Square location ID

async function fetchProducts() {
    const response = await fetch(`https://connect.squareup.com/v2/catalog/list`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Square-Version": "2023-12-13" // Check for the latest version in Square Docs
        }
    });

    const data = await response.json();

    if (data.objects) {
        displayProducts(data.objects);
    } else {
        console.error("Error fetching products", data);
    }
}

function displayProducts(products) {
    const productContainer = document.querySelector(".products");
    productContainer.innerHTML = "";  // Clear existing content

    products.forEach(product => {
        if (product.type === "ITEM") {
            const itemData = product.item_data;
            const productCard = `
                <article class="product">
                    <img src="${itemData.image_url || 'placeholder.jpg'}" alt="${itemData.name}">
                    <h2>${itemData.name}</h2>
                    <p>${itemData.description || 'No description available'}</p>
                    <p><strong>Price:</strong> $${(itemData.variations[0]?.item_variation_data.price_money.amount / 100).toFixed(2)}</p>
                    <button onclick="addToCart('${itemData.variations[0]?.id}')">Add to Cart</button>
                </article>
            `;
            productContainer.innerHTML += productCard;
        }
    });
}
let cart = [];

function addToCart(variationId) {
    const existingItem = cart.find(item => item.variationId === variationId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ variationId, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.querySelector(".cart");
    cartContainer.innerHTML = cart.map(item => `<p>${item.variationId} x ${item.quantity}</p>`).join("");
}

async function checkout() {
    const response = await fetch(`https://connect.squareup.com/v2/checkout`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idempotency_key: new Date().getTime().toString(),
            order: {
                location_id: locationId,
                line_items: cart.map(item => ({
                    catalog_object_id: item.variationId,
                    quantity: item.quantity.toString()
                }))
            },
            redirect_url: "https://yourwebsite.com/thank-you"
        })
    });

    const data = await response.json();
    if (data.checkout) {
        window.location.href = data.checkout.checkout_page_url;
    } else {
        console.error("Checkout failed", data);
    }
}

// Call function to fetch products on page load
document.addEventListener("DOMContentLoaded", fetchProducts);
