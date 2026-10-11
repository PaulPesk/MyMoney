const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (token) {
        showDashboard();
    } else {
        showAuthScreen();
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    const registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.addEventListener("submit", handleRegister);

    const transactionForm = document.getElementById("transactionForm");
    if (transactionForm) transactionForm.addEventListener("submit", handleAddTransaction);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
});

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// --- AUTHENTICATION ---

async function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    if (!emailInput || !passwordInput) return;

    const formData = new URLSearchParams();
    formData.append("username", emailInput.value);
    formData.append("password", passwordInput.value);

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            showDashboard();
        } else {
            const err = await response.json();
            alert(err.detail || "Login failed. Please check your credentials.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Connection error with the server.");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert("Registration successful! Please sign in.");
            document.getElementById("registerForm").reset();
        } else {
            const err = await response.json();
            alert(err.detail || "Registration failed.");
        }
    } catch (error) {
        console.error("Register error:", error);
        alert("Error during registration.");
    }
}

function handleLogout() {
    localStorage.removeItem("token");
    showAuthScreen();
}

// --- UI VIEWS ---

function showAuthScreen() {
    const authContainer = document.getElementById("authContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    const userInfo = document.getElementById("userInfo");

    if (authContainer) authContainer.classList.remove("hidden");
    if (dashboardContainer) dashboardContainer.classList.add("hidden");
    if (userInfo) userInfo.classList.add("hidden");
}

function showDashboard() {
    const authContainer = document.getElementById("authContainer");
    const dashboardContainer = document.getElementById("dashboardContainer");
    const userInfo = document.getElementById("userInfo");

    if (authContainer) authContainer.classList.add("hidden");
    if (dashboardContainer) dashboardContainer.classList.remove("hidden");
    if (userInfo) userInfo.classList.remove("hidden");

    loadTransactions();
    loadAnalytics();
}

// --- TRANSACTIONS & DELETE & ANALYTICS ---

async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions/`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const transactions = await response.json();
            renderTransactionsList(transactions);
            calculateTotals(transactions);
        } else if (response.status === 401) {
            handleLogout();
        }
    } catch (error) {
        console.error("Error loading transactions:", error);
    }
}

async function handleAddTransaction(event) {
    event.preventDefault();
    const type = document.getElementById("transType").value;
    const category = document.getElementById("transCategory").value;
    const amount = parseFloat(document.getElementById("transAmount").value);

    try {
        const response = await fetch(`${API_URL}/transactions/`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ type, category, amount })
        });

        if (response.ok) {
            document.getElementById("transactionForm").reset();
            loadTransactions();
            loadAnalytics();
        } else {
            alert("Failed to add transaction.");
        }
    } catch (error) {
        console.error("Error adding transaction:", error);
    }
}

async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (response.ok) {
            loadTransactions();
            loadAnalytics();
        } else {
            alert("Failed to delete transaction.");
        }
    } catch (error) {
        console.error("Error deleting transaction:", error);
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics/by-category`, {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const categories = await response.json();
            renderCategoryBreakdown(categories);
        } else {
            console.error("Failed to load analytics");
        }
    } catch (error) {
        console.error("Error loading analytics:", error);
    }
}

function calculateTotals(transactions) {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        if (t.type.toUpperCase() === "INCOME") {
            totalIncome += t.amount;
        } else if (t.type.toUpperCase() === "EXPENSE") {
            totalExpenses += t.amount;
        }
    });

    const netBalance = totalIncome - totalExpenses;

    document.getElementById("totalIncome").textContent = `€${totalIncome.toFixed(2)}`;
    document.getElementById("totalExpenses").textContent = `€${totalExpenses.toFixed(2)}`;
    
    const netEl = document.getElementById("netBalance");
    netEl.textContent = `€${netBalance.toFixed(2)}`;
    netEl.className = `text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-600' : 'text-red-600'}`;
}

function renderTransactionsList(transactions) {
    const listEl = document.getElementById("transactionsList");
    if (!listEl) return;
    listEl.innerHTML = "";
    
    if (!transactions || transactions.length === 0) {
        listEl.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500 italic">No transactions found.</td></tr>`;
        return;
    }

    transactions.forEach(t => {
        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50";
        
        const typeColor = t.type.toUpperCase() === "INCOME" ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
        
        row.innerHTML = `
            <td class="p-3 ${typeColor}">${t.type}</td>
            <td class="p-3 text-gray-800">${t.category}</td>
            <td class="p-3 text-gray-700">€${t.amount.toFixed(2)}</td>
            <td class="p-3 text-right">
                <button onclick="deleteTransaction(${t.id})" class="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-xs font-semibold transition">Delete</button>
            </td>
        `;
        listEl.appendChild(row);
    });
}

function renderCategoryBreakdown(categories) {
    const breakdownEl = document.getElementById("categoryBreakdown");
    if (!breakdownEl) return;
    breakdownEl.innerHTML = "";

    if (!categories || Object.keys(categories).length === 0) {
        breakdownEl.innerHTML = `<p class="text-gray-500 text-sm italic py-2 text-center">No analytics data available...</p>`;
        return;
    }

    for (const [cat, amount] of Object.entries(categories)) {
        const row = document.createElement("div");
        row.className = "flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg";
        row.innerHTML = `<span class="font-medium text-gray-700">${cat}</span> <span class="font-bold text-gray-900">€${amount.toFixed(2)}</span>`;
        breakdownEl.appendChild(row);
    }
}