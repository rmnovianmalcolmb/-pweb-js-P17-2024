let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentPage = 1;
let itemsPerPage = 10;

async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=0");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    products = data.products.map((product) => ({
      ...product,
      price: kursRupiah(product),
    }));
    filteredProducts = products;
    displayProducts(filteredProducts);
  } catch (error) {
    console.error("Failed to fetch product data:", error);
    alert("Failed to fetch product data. Please try again later.");
  }
}

function kursRupiah(product) {
  return product.price * 15000;
}

function formatRupiah(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(price);
}

function displayProducts(productsList) {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = "";

  const paginatedProducts = paginate(productsList, itemsPerPage, currentPage);
  paginatedProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
      <h3>${product.title}</h3>
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
      <p>Price: ${formatRupiah(product.price)}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productsContainer.appendChild(productCard);
  });
  updatePagination(productsList.length);
}

function paginate(productsList, itemsPerPage, page) {
  return productsList.slice((page - 1) * itemsPerPage, page * itemsPerPage);
}

function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const prevButton = createButton("Previous", prevPage, currentPage === 1);
  paginationContainer.appendChild(prevButton);

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = createButton(i, () => goToPage(i), false, i === currentPage);
    paginationContainer.appendChild(pageButton);
  }

  const nextButton = createButton("Next", nextPage, currentPage === totalPages);
  paginationContainer.appendChild(nextButton);

  paginationContainer.style.display = totalPages > 1 ? "flex" : "none";
}

function createButton(text, onClick, isDisabled, isActive = false) {
  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = onClick;
  button.disabled = isDisabled;
  if (isActive) button.classList.add("active");
  return button;
}

function goToPage(page) {
  currentPage = page;
  displayProducts(filteredProducts);
}

function nextPage() {
  if (currentPage * itemsPerPage < filteredProducts.length) {
    currentPage++;
    displayProducts(filteredProducts);
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayProducts(filteredProducts);
  }
}

function filterByCategory(category) {
  filteredProducts = category === "all" 
    ? products 
    : products.filter((product) => product.category === category);
  currentPage = 1;
  displayProducts(filteredProducts);
}

function addToCart(productId) {
  const product = products.find((product) => product.id === productId);
  const existingProduct = cart.find((item) => item.id === productId);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function removeOneItem(productId) {
  const existingProductIndex = cart.findIndex((item) => item.id === productId);

  if (existingProductIndex !== -1) {
    if (cart[existingProductIndex].quantity > 1) {
      cart[existingProductIndex].quantity -= 1;
    } else {
      cart.splice(existingProductIndex, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
  }
}

function updateCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  cartItemsContainer.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <p>${item.title} - ${formatRupiah(item.price)} (x${item.quantity})</p>
      <button onclick="removeOneItem(${item.id})">-</button>
      <button onclick="removeFromCart(${item.id})">Remove</button>
      <button onclick="addToCart(${item.id})">+</button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  document.getElementById("total-items").textContent = totalItems;
  document.getElementById("total-price").textContent = formatRupiah(totalPrice);
}

function checkout() {
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  alert(`Total price: ${formatRupiah(totalPrice)}`);
  cart = [];
  localStorage.removeItem("cart");
  updateCart();
}

function changeItemsPerPage() {
  const selectElement = document.getElementById("items-per-page");
  itemsPerPage = parseInt(selectElement.value);
  
  displayProducts(filteredProducts);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  updateCart();
  
  const itemsPerPageSelect = document.getElementById('items-per-page');
  if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', changeItemsPerPage);
  }
});
