let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentPage = 1;
let itemsPerPage = 10;

async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=0");
    const data = await response.json();
    products = data.products.map((product) => {
      return {
        ...product,
        price: kursRupiah(product),
      };
    });
    filteredProducts = products;
    displayProducts(filteredProducts);
  } catch (error) {
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
            <img src="${product.thumbnail}" alt="${product.title}">
            <p>Price: ${formatRupiah(product.price)}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
    productsContainer.appendChild(productCard);
  });
  updatePagination(productsList.length);
}

// Menentukan item dari index ke berapa hingga index ke berapa yang akan ditampilkan
function paginate(productsList, itemsPerPage, page) {
  return productsList.slice((page - 1) * itemsPerPage, page * itemsPerPage);
}

// Update nomor page
function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  document.getElementById("page-number").textContent = `Page ${currentPage}`;
  document.getElementById("pagination").style.display =
    totalPages > 1 ? "block" : "none";
}

// Change items per page
function changeItemsPerPage() {
  const selectElement = document.getElementById("items-per-page");
  itemsPerPage = parseInt(selectElement.value);
  currentPage = 1; // Reset ke page 1 ketika mengganti items per page
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
  if (category === "all") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter((product) => product.category === category);
  }
  currentPage = 1; //Reset ke page 1 ketika mengganti kategori
  displayProducts(filteredProducts);
}

function addToCart(productId) {
  const product = products.find((product) => product.id === productId);
  const existingProduct = cart.find((item) => item.id === productId);

  if (existingProduct) {
    existingProduct.quantity += 1; // Increase quantity if item already in cart
  } else {
    product.quantity = 1; // Set quantity to 1 for new items
    cart.push(product);
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
  const existingProduct = cart.find((item) => item.id === productId);

  if (existingProduct.quantity > 1) {
    existingProduct.quantity -= 1;
  } else {
    cart = cart.filter((item) => item.id !== productId);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
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

  document.getElementById("total-items").textContent = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  document.getElementById("total-price").textContent = formatRupiah(
    cart.reduce((total, item) => total + item.price * item.quantity, 0)
  );
}

function checkout() {
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  alert(`Total price: ${formatRupiah(totalPrice)}`);
  cart = [];
  localStorage.removeItem("cart");
  updateCart();
}

fetchProducts();
updateCart();
