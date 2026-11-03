// Unit IV: Variables and Constants
let cart = [];
let discountPercent = 0;
const TAX_RATE = 0.05;

// Unit V: Date Display
const now = new Date();
document.getElementById("date-display").innerText = now.toLocaleDateString();

// Load active temporary cart from localStorage if present
const savedCart = localStorage.getItem("supermarketActiveCart");
if (savedCart) {
    cart = JSON.parse(savedCart);
    renderCart();
}

// Event Listeners
document.getElementById("add-preset-btn").addEventListener("click", addPresetItem);
document.getElementById("add-custom-btn").addEventListener("click", addCustomItem);
document.getElementById("apply-coupon-btn").addEventListener("click", applyCoupon);
document.getElementById("pay-btn").addEventListener("click", checkoutAndDownloadReceipt);
document.getElementById("pdf-btn").addEventListener("click", printReceiptPDF);
document.getElementById("clear-btn").addEventListener("click", clearCurrentCart);

// Helper function to validate phone number using Regex
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// 1. Add Preset Item
function addPresetItem() {
    const phone = document.getElementById("customer-phone").value.trim();
    const errorMsg = document.getElementById("error-msg");

    if (!isValidPhone(phone)) {
        errorMsg.innerText = "Please enter a valid 10-digit customer phone first.";
        return;
    }

    const select = document.getElementById("item-select");
    const name = select.value;
    const price = Number(select.options[select.selectedIndex].getAttribute("data-price"));
    const qty = Number(document.getElementById("preset-qty").value);

    if (qty <= 0) {
        errorMsg.innerText = "Quantity must be at least 1.";
        return;
    }

    errorMsg.innerText = "";
    cart.push({ name: name, price: price, qty: qty, total: price * qty });
    saveActiveCart();
    renderCart();
}

// 2. Add Custom / Unknown Item (New Feature)
function addCustomItem() {
    const phone = document.getElementById("customer-phone").value.trim();
    const errorMsg = document.getElementById("error-msg");

    if (!isValidPhone(phone)) {
        errorMsg.innerText = "Please enter a valid 10-digit customer phone first.";
        return;
    }

    const customName = document.getElementById("custom-name").value.trim();
    const customPrice = Number(document.getElementById("custom-price").value);
    const customQty = Number(document.getElementById("custom-qty").value);

    // Form Validation Basics (Unit II & V)
    if (customName === "") {
        errorMsg.innerText = "Please enter a name for the custom item.";
        return;
    }
    if (customPrice <= 0 || isNaN(customPrice)) {
        errorMsg.innerText = "Please enter a valid price for the custom item.";
        return;
    }
    if (customQty <= 0 || isNaN(customQty)) {
        errorMsg.innerText = "Quantity must be at least 1.";
        return;
    }

    errorMsg.innerText = "";

    // Add object to cart array
    cart.push({
        name: customName + " (Custom)",
        price: customPrice,
        qty: customQty,
        total: customPrice * customQty
    });

    // Reset custom input fields
    document.getElementById("custom-name").value = "";
    document.getElementById("custom-price").value = "";
    document.getElementById("custom-qty").value = "1";

    saveActiveCart();
    renderCart();
}

// Render cart items to table
function renderCart() {
    const cartBody = document.getElementById("cart-body");
    cartBody.innerHTML = "";

    let subTotal = 0;

    for (let i = 0; i < cart.length; i++) {
        subTotal += cart[i].total;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${cart[i].name}</td>
            <td>Rs. ${cart[i].price}</td>
            <td>${cart[i].qty}</td>
            <td>Rs. ${cart[i].total}</td>
            <td><button class="btn-small clear-btn" onclick="removeItem(${i})">X</button></td>
        `;
        cartBody.appendChild(row);
    }

    const tax = subTotal * TAX_RATE;
    const discount = (subTotal * discountPercent) / 100;
    const grand = subTotal + tax - discount;

    document.getElementById("sub-total").innerText = subTotal.toFixed(2);
    document.getElementById("tax-amount").innerText = tax.toFixed(2);
    document.getElementById("discount-amount").innerText = discount.toFixed(2);
    document.getElementById("grand-total").innerText = grand.toFixed(2);
}

function removeItem(index) {
    cart.splice(index, 1);
    saveActiveCart();
    renderCart();
}

function applyCoupon() {
    const code = document.getElementById("coupon-code").value.trim().toUpperCase();
    const msg = document.getElementById("receipt-msg");

    if (code === "SAVE10") {
        discountPercent = 10;
        msg.innerText = "10% Coupon Applied Successfully!";
    } else {
        discountPercent = 0;
        msg.innerText = "Invalid Promo Code.";
    }
    renderCart();
}

// 3. Permanent History Storage & Text Receipt Download
function checkoutAndDownloadReceipt() {
    const msg = document.getElementById("receipt-msg");
    const phone = document.getElementById("customer-phone").value.trim();

    if (cart.length === 0) {
        msg.innerText = "Cart is empty. Add items first!";
        return;
    }

    const subTotal = document.getElementById("sub-total").innerText;
    const tax = document.getElementById("tax-amount").innerText;
    const discount = document.getElementById("discount-amount").innerText;
    const grand = document.getElementById("grand-total").innerText;
    const receiptDate = new Date().toLocaleString();
    const receiptId = "REC-" + Date.now();

    // Create Receipt Record Object
    const receiptRecord = {
        id: receiptId,
        date: receiptDate,
        phone: phone,
        items: cart,
        subTotal: subTotal,
        tax: tax,
        discount: discount,
        grandTotal: grand
    };

    // Save permanently in localStorage purchase history array
    let history = localStorage.getItem("supermarketPurchaseHistory");
    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }
    history.push(receiptRecord);
    localStorage.setItem("supermarketPurchaseHistory", JSON.stringify(history));

    // Build plain text receipt string
    let receiptText = "========================================\n";
    receiptText += "        SUPERMARKET RECEIPT             \n";
    receiptText += "========================================\n";
    receiptText += "Receipt ID : " + receiptId + "\n";
    receiptText += "Date       : " + receiptDate + "\n";
    receiptText += "Customer   : " + phone + "\n";
    receiptText += "----------------------------------------\n";
    receiptText += "Item                 Qty   Price   Total\n";
    receiptText += "----------------------------------------\n";

    for (let i = 0; i < cart.length; i++) {
        const itemLine = `${cart[i].name.padEnd(20)} ${String(cart[i].qty).padEnd(5)} ${String(cart[i].price).padEnd(7)} ${cart[i].total}\n`;
        receiptText += itemLine;
    }

    receiptText += "----------------------------------------\n";
    receiptText += "Subtotal   : Rs. " + subTotal + "\n";
    receiptText += "GST (5%)   : Rs. " + tax + "\n";
    receiptText += "Discount   : Rs. -" + discount + "\n";
    receiptText += "GRAND TOTAL: Rs. " + grand + "\n";
    receiptText += "========================================\n";
    receiptText += "     Thank You! Visit Again!           \n";
    receiptText += "========================================\n";

    // Download text receipt file using HTML5 anchor download
    const blob = new Blob([receiptText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${receiptId}.txt`;
    link.click();

    msg.innerText = "Receipt saved to history and downloaded!";
    clearCurrentCart();
}

// 4. Print / Save as PDF Function
function printReceiptPDF() {
    if (cart.length === 0) {
        alert("Cart is empty! Add items before printing.");
        return;
    }
    window.print();
}

function clearCurrentCart() {
    cart = [];
    discountPercent = 0;
    document.getElementById("coupon-code").value = "";
    localStorage.removeItem("supermarketActiveCart");
    renderCart();
}

function saveActiveCart() {
    localStorage.setItem("supermarketActiveCart", JSON.stringify(cart));
}
