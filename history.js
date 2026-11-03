// Load past receipts from localStorage
const historyContainer = document.getElementById("history-container");
const clearHistoryBtn = document.getElementById("clear-history-btn");

clearHistoryBtn.addEventListener("click", function() {
    if (confirm("Are you sure you want to permanently delete all purchase history?")) {
        localStorage.removeItem("supermarketPurchaseHistory");
        renderHistory();
    }
});

function renderHistory() {
    const rawData = localStorage.getItem("supermarketPurchaseHistory");
    historyContainer.innerHTML = "";

    if (!rawData) {
        historyContainer.innerHTML = "<p>No past receipts found. Complete a checkout first!</p>";
        return;
    }

    const historyList = JSON.parse(rawData);

    if (historyList.length === 0) {
        historyContainer.innerHTML = "<p>No past receipts found.</p>";
        return;
    }

    // Display receipts in reverse order (newest first)
    for (let i = historyList.length - 1; i >= 0; i--) {
        const item = historyList[i];
        const card = document.createElement("div");
        card.className = "receipt-card";

        // Build item details list
        let itemsListHtml = "<ul>";
        for (let j = 0; j < item.items.length; j++) {
            itemsListHtml += `<li>${item.items[j].name} - ${item.items[j].qty} x Rs. ${item.items[j].price} = Rs. ${item.items[j].total}</li>`;
        }
        itemsListHtml += "</ul>";

        card.innerHTML = `
            <h3>Receipt: ${item.id}</h3>
            <p><strong>Date:</strong> ${item.date}</p>
            <p><strong>Customer Phone:</strong> ${item.phone}</p>
            <p><strong>Purchased Items:</strong></p>
            ${itemsListHtml}
            <p><strong>Subtotal:</strong> Rs. ${item.subTotal} | <strong>GST:</strong> Rs. ${item.tax} | <strong>Discount:</strong> Rs. ${item.discount}</p>
            <h4 style="color:#2f855a; margin-top:5px;">Grand Total Paid: Rs. ${item.grandTotal}</h4>
        `;

        historyContainer.appendChild(card);
    }
}

// Initial render when history.html loads
renderHistory();
