// Fuel prices (in rupees)
const fuelPrices = {
    petrol: 100.00,
    diesel: 90.00,
    premium: 110.00
};

// Staff credentials (in real application, this should be in a secure database)
const staffCredentials = {
    'admin': 'admin123',
    'staff1': 'password123'
};

// Tank capacities
const tankCapacity = {
    petrol: 20000,
    diesel: 20000,
    premium: 20000
};

let currentTankLevels = {
    petrol: 15000,
    diesel: 18000,
    premium: 12000
};

let dailyStats = {
    totalSales: 0,
    totalLiters: 0,
    transactions: 0
};

// Loyalty points rate (1 point per 100 rupees)
const POINTS_RATE = 0.01;

// DOM elements
const fuelTypeSelect = document.getElementById('fuelType');
const quantityInput = document.getElementById('quantity');
const pricePerLiterDisplay = document.getElementById('pricePerLiter');
const totalAmountDisplay = document.getElementById('totalAmount');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const historyList = document.getElementById('history');
const loginSection = document.getElementById('loginSection');
const mainSystem = document.getElementById('mainSystem');
const loginBtn = document.getElementById('loginBtn');
const username = document.getElementById('username');
const password = document.getElementById('password');
const customerName = document.getElementById('customerName');
const vehicleNumber = document.getElementById('vehicleNumber');
const phoneNumber = document.getElementById('phoneNumber');
const paymentType = document.getElementById('paymentType');
const generateReceiptBtn = document.getElementById('generateReceiptBtn');
const receiptModal = document.getElementById('receiptModal');
const receiptContent = document.getElementById('receiptContent');
const closeModal = document.querySelector('.close');
const printReceiptBtn = document.getElementById('printReceiptBtn');

// Add these constants at the top of your file
const FUEL_THRESHOLD = {
    LOW: 5000,  // Low fuel warning threshold (in liters)
    CRITICAL: 1000  // Critical fuel warning threshold (in liters)
};

// Notification system
class NotificationSystem {
    constructor() {
        this.notificationsList = document.getElementById('notificationsList');
        this.subscribers = new Map();
    }

    addNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <small>${new Date().toLocaleTimeString()}</small>
            </div>
        `;

        this.notificationsList.insertBefore(notification, this.notificationsList.firstChild);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    subscribe(phoneNumber, fuelTypes) {
        if (!this.isValidPhoneNumber(phoneNumber)) {
            this.addNotification('Please enter a valid phone number', 'danger');
            return false;
        }

        this.subscribers.set(phoneNumber, fuelTypes);
        this.addNotification(`Subscribed ${phoneNumber} to fuel updates`, 'success');
        return true;
    }

    isValidPhoneNumber(phone) {
        // Basic phone number validation
        return /^\d{10}$/.test(phone);
    }

    notifySubscribers(fuelType, status) {
        this.subscribers.forEach((fuelTypes, phoneNumber) => {
            if (fuelTypes.includes(fuelType)) {
                // In a real application, this would send an SMS or push notification
                console.log(`Notifying ${phoneNumber} about ${fuelType}: ${status}`);
            }
        });
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Function to update fuel status
function updateFuelStatus() {
    const fuels = ['petrol', 'diesel', 'premium'];
    
    fuels.forEach(fuel => {
        const level = currentTankLevels[fuel];
        const statusCard = document.getElementById(`${fuel}Status`);
        const stockLevel = document.getElementById(`${fuel}StockLevel`);
        const indicator = statusCard.querySelector('.status-indicator');
        const availabilityText = statusCard.querySelector('.availability-text');

        stockLevel.textContent = `${level}L`;

        if (level <= FUEL_THRESHOLD.CRITICAL) {
            indicator.className = 'status-indicator unavailable';
            availabilityText.textContent = 'Unavailable';
            notificationSystem.addNotification(
                `${fuel.toUpperCase()} is currently unavailable!`,
                'danger'
            );
        } else if (level <= FUEL_THRESHOLD.LOW) {
            indicator.className = 'status-indicator low';
            availabilityText.textContent = 'Low Stock';
            notificationSystem.addNotification(
                `${fuel.toUpperCase()} stock is running low!`,
                'warning'
            );
        } else {
            indicator.className = 'status-indicator available';
            availabilityText.textContent = 'Available';
        }
    });
}

// Subscribe button event listener
document.getElementById('subscribeBtn').addEventListener('click', () => {
    const phoneNumber = document.getElementById('customerPhone').value;
    const selectedFuels = Array.from(document.querySelectorAll('.fuel-type-checkboxes input:checked'))
        .map(checkbox => checkbox.value);

    if (selectedFuels.length === 0) {
        notificationSystem.addNotification('Please select at least one fuel type', 'warning');
        return;
    }

    if (notificationSystem.subscribe(phoneNumber, selectedFuels)) {
        document.getElementById('customerPhone').value = '';
        document.querySelectorAll('.fuel-type-checkboxes input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
});

// Update price per liter when fuel type changes
fuelTypeSelect.addEventListener('change', () => {
    const selectedFuel = fuelTypeSelect.value;
    pricePerLiterDisplay.textContent = `₹${fuelPrices[selectedFuel].toFixed(2)}`;
    calculateTotal();
});

// Calculate total when quantity changes
quantityInput.addEventListener('input', calculateTotal);

// Login handler
loginBtn.addEventListener('click', () => {
    if (staffCredentials[username.value] === password.value) {
        loginSection.style.display = 'none';
        mainSystem.style.display = 'block';
        updateTankLevels();
    } else {
        alert('Invalid credentials!');
    }
});

// Update tank level displays
function updateTankLevels() {
    for (let fuel in currentTankLevels) {
        const level = (currentTankLevels[fuel] / tankCapacity[fuel]) * 100;
        document.getElementById(`${fuel}Level`).style.height = `${level}%`;
        document.getElementById(`${fuel}Capacity`).textContent = 
            `${currentTankLevels[fuel]}/${tankCapacity[fuel]}L`;
    }
    updateFuelStatus();
}

// Update daily stats
function updateDailyStats(amount, liters) {
    dailyStats.totalSales += amount;
    dailyStats.totalLiters += liters;
    dailyStats.transactions += 1;

    document.getElementById('totalSales').textContent = dailyStats.totalSales.toFixed(2);
    document.getElementById('totalLiters').textContent = dailyStats.totalLiters.toFixed(2);
    document.getElementById('totalTransactions').textContent = dailyStats.transactions;
}

// Generate receipt
generateReceiptBtn.addEventListener('click', () => {
    if (!customerName.value || !vehicleNumber.value) {
        alert('Please enter customer details!');
        return;
    }

    const transaction = createTransaction();
    const receipt = `
        <h3>Fuel Purchase Receipt</h3>
        <p>Date: ${new Date().toLocaleString()}</p>
        <p>Customer: ${customerName.value}</p>
        <p>Vehicle: ${vehicleNumber.value}</p>
        <p>Fuel Type: ${transaction.fuelType.toUpperCase()}</p>
        <p>Quantity: ${transaction.quantity}L</p>
        <p>Price per Liter: ₹${transaction.pricePerLiter}</p>
        <p>Total Amount: ₹${transaction.total.toFixed(2)}</p>
        <p>Payment Method: ${paymentType.value.toUpperCase()}</p>
        <p>Points Earned: ${Math.floor(transaction.total * POINTS_RATE)}</p>
    `;

    receiptContent.innerHTML = receipt;
    receiptModal.style.display = 'block';
});

// Close modal
closeModal.addEventListener('click', () => {
    receiptModal.style.display = 'none';
});

// Print receipt
printReceiptBtn.addEventListener('click', () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(receiptContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
});

// Modify the existing calculateBtn click handler
calculateBtn.addEventListener('click', () => {
    if (!quantityInput.value || quantityInput.value <= 0) {
        alert('Please enter a valid quantity!');
        return;
    }

    const selectedFuel = fuelTypeSelect.value;
    const quantity = parseFloat(quantityInput.value);

    // Check if there's enough fuel in the tank
    if (quantity > currentTankLevels[selectedFuel]) {
        alert('Not enough fuel in tank!');
        return;
    }

    const transaction = createTransaction();
    addToHistory(transaction);
    
    // Update tank levels
    currentTankLevels[selectedFuel] -= quantity;
    updateTankLevels();

    // Update daily stats
    updateDailyStats(transaction.total, quantity);

    // Update loyalty points
    const pointsEarned = Math.floor(transaction.total * POINTS_RATE);
    document.getElementById('pointsEarned').textContent = pointsEarned;
    const currentPoints = parseInt(document.getElementById('totalPoints').textContent);
    document.getElementById('totalPoints').textContent = currentPoints + pointsEarned;

    // Update fuel status after dispensing
    updateFuelStatus();
});

// Reset button click handler
resetBtn.addEventListener('click', () => {
    fuelTypeSelect.value = 'petrol';
    quantityInput.value = '';
    pricePerLiterDisplay.textContent = `₹${fuelPrices.petrol.toFixed(2)}`;
    totalAmountDisplay.textContent = '₹0.00';
});

// Calculate total amount
function calculateTotal() {
    const selectedFuel = fuelTypeSelect.value;
    const quantity = parseFloat(quantityInput.value) || 0;
    const total = fuelPrices[selectedFuel] * quantity;
    totalAmountDisplay.textContent = `₹${total.toFixed(2)}`;
}

// Create transaction object
function createTransaction() {
    const selectedFuel = fuelTypeSelect.value;
    const quantity = parseFloat(quantityInput.value);
    const total = fuelPrices[selectedFuel] * quantity;
    
    return {
        fuelType: selectedFuel,
        quantity: quantity,
        pricePerLiter: fuelPrices[selectedFuel],
        total: total,
        timestamp: new Date().toLocaleString()
    };
}

// Add transaction to history
function addToHistory(transaction) {
    const listItem = document.createElement('li');
    listItem.textContent = `${transaction.timestamp} - ${transaction.fuelType.toUpperCase()}: ${transaction.quantity}L @ ₹${transaction.pricePerLiter}/L = ₹${transaction.total.toFixed(2)}`;
    historyList.insertBefore(listItem, historyList.firstChild);
}

// Initialize display
pricePerLiterDisplay.textContent = `₹${fuelPrices.petrol.toFixed(2)}`;

window.addEventListener('load', () => {
    // Initialize fuel status
    updateFuelStatus();
    
    // Check fuel levels periodically
    setInterval(updateFuelStatus, 60000); // Check every minute
});

// Add these at the top with your other variables
let priceHistory = {
    petrol: [],
    diesel: [],
    premium: [],
    dates: []
};

// Initialize price chart
let priceChart;

// Function to initialize the price chart
function initializePriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: priceHistory.dates,
            datasets: [
                {
                    label: 'Petrol',
                    data: priceHistory.petrol,
                    borderColor: '#ff6384',
                    tension: 0.1
                },
                {
                    label: 'Diesel',
                    data: priceHistory.diesel,
                    borderColor: '#36a2eb',
                    tension: 0.1
                },
                {
                    label: 'Premium',
                    data: priceHistory.premium,
                    borderColor: '#4bc0c0',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Fuel Price Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (₹)'
                    }
                }
            }
        }
    });
}

// Function to update price history
function updatePriceHistory() {
    const date = new Date().toLocaleDateString();
    
    // Remove oldest date if we have more than 7 days
    if (priceHistory.dates.length >= 7) {
        priceHistory.dates.shift();
        priceHistory.petrol.shift();
        priceHistory.diesel.shift();
        priceHistory.premium.shift();
    }

    // Add new prices
    priceHistory.dates.push(date);
    priceHistory.petrol.push(fuelPrices.petrol);
    priceHistory.diesel.push(fuelPrices.diesel);
    priceHistory.premium.push(fuelPrices.premium);

    // Update chart
    priceChart.update();

    // Save to localStorage
    localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
}

// Function to update price change indicators
function updatePriceChangeIndicators() {
    const types = ['petrol', 'diesel', 'premium'];
    
    types.forEach(type => {
        const current = fuelPrices[type];
        const previous = priceHistory[type][priceHistory[type].length - 2] || current;
        const change = current - previous;
        const changeElement = document.getElementById(`${type}PriceChange`);
        
        if (change !== 0) {
            const changeText = change > 0 ? `↑ ₹${change.toFixed(2)}` : `↓ ₹${Math.abs(change).toFixed(2)}`;
            changeElement.textContent = changeText;
            changeElement.className = `price-change ${change > 0 ? 'increase' : 'decrease'}`;
        } else {
            changeElement.textContent = 'No change';
            changeElement.className = 'price-change';
        }
    });
}

// Function to update current price displays
function updateCurrentPriceDisplays() {
    document.getElementById('currentPetrolPrice').textContent = `₹${fuelPrices.petrol.toFixed(2)}`;
    document.getElementById('currentDieselPrice').textContent = `₹${fuelPrices.diesel.toFixed(2)}`;
    document.getElementById('currentPremiumPrice').textContent = `₹${fuelPrices.premium.toFixed(2)}`;
}

// Event listener for price updates
document.getElementById('updatePricesBtn').addEventListener('click', () => {
    const newPrices = {
        petrol: parseFloat(document.getElementById('newPetrolPrice').value),
        diesel: parseFloat(document.getElementById('newDieselPrice').value),
        premium: parseFloat(document.getElementById('newPremiumPrice').value)
    };

    // Validate new prices
    if (Object.values(newPrices).some(price => isNaN(price) || price <= 0)) {
        alert('Please enter valid prices for all fuel types');
        return;
    }

    // Update prices
    fuelPrices.petrol = newPrices.petrol;
    fuelPrices.diesel = newPrices.diesel;
    fuelPrices.premium = newPrices.premium;

    // Update displays
    updatePriceHistory();
    updateCurrentPriceDisplays();
    updatePriceChangeIndicators();

    // Clear input fields
    document.getElementById('newPetrolPrice').value = '';
    document.getElementById('newDieselPrice').value = '';
    document.getElementById('newPremiumPrice').value = '';

    alert('Fuel prices updated successfully!');
});

// Load price history from localStorage on startup
window.addEventListener('load', () => {
    const savedHistory = localStorage.getItem('priceHistory');
    if (savedHistory) {
        priceHistory = JSON.parse(savedHistory);
    } else {
        // Initialize with current prices
        const date = new Date().toLocaleDateString();
        priceHistory.dates.push(date);
        priceHistory.petrol.push(fuelPrices.petrol);
        priceHistory.diesel.push(fuelPrices.diesel);
        priceHistory.premium.push(fuelPrices.premium);
    }

    initializePriceChart();
    updateCurrentPriceDisplays();
    updatePriceChangeIndicators();
});