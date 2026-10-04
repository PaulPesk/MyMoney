const API_URL = "";
let token = localStorage.getItem("access_token");
let isLoginMode = true;

document.addEventListener("DOMContentLoaded", () => {
    if (token) {
        showDashboard();
    } else {
        showAuth();
    }
});

// --- HELPER FUNCTIONS ---

function setDefaultTxDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById("txDate");
    if (dateInput) dateInput.value = today;
}

// --- AUTHENTICATION FUNCTIONS ---

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById("authTitle").innerText = isLoginMode ? "Sign In" : "Create Account";
    document.getElementById("authSubmitBtn").innerText = isLoginMode ? "Sign In" : "Register";
    document.getElementById("authToggleText").innerText = isLoginMode ? "Don't have an account?" : "Already have an account?";
    document.getElementById("authToggleBtn").innerText = isLoginMode ? "Register" : "Sign In";
}

async function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    const endpoint = isLoginMode ? "/auth/login" : "/auth/register";

    try {
        let res;
        if (isLoginMode) {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            });
        } else {
            res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
        }

        const data = await res.json();

        if (res.ok) {
            if (isLoginMode) {
                token = data.access_token;
                localStorage.setItem("access_token", token);
                localStorage.setItem("user_email", email);
                showDashboard();
            } else {
                alert("Account created successfully! Please sign in.");
                toggleAuthMode();
            }
        } else {
            alert(data.detail || "Authentication failed.");
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("An error occurred. Please try again.");
    }
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    token = null;
    showAuth();
}

function getAuthHeaders() {
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

function showAuth() {
    document.getElementById("authSection").classList.remove("hidden");
    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("userInfo").classList.add("hidden");
}

function showDashboard() {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("dashboardSection").classList.remove("hidden");
    document.getElementById("userInfo").classList.remove("hidden");
    document.getElementById("userEmail").innerText = localStorage.getItem("user_email") || "";

    setDefaultTxDate();
    loadAnalytics();
    loadTransactions();
}

// --- DASHBOARD & ANALYTICS FUNCTIONS ---

async function loadAnalytics() {
    const startDate = document.getElementById("filterStartDate")?.value;
    const endDate = document.getElementById("filterEndDate")?.value;

    let queryParams = new URLSearchParams();
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    try {
        // 1. Summary Analytics
        const resSummary = await fetch(`${API_URL}/analytics/summary${queryString}`, { headers: getAuthHeaders() });
        if (resSummary.ok) {
            const data = await resSummary.json();
            document.getElementById("totalIncome").innerText = `€${data.total_income.toFixed(2)}`;
            document.getElementById("totalExpenses").innerText = `€${data.total_expenses.toFixed(2)}`;
            document.getElementById("netBalance").innerText = `€${data.net_balance.toFixed(2)}`;
        }

        // 2. Category Analytics
        const resCat = await fetch(`${API_URL}/analytics/by-category${queryString}`, { headers: getAuthHeaders() });
        if (resCat.ok) {
            const data = await resCat.json();
            
            let categoriesObj = {};

            if (Array.isArray(data.expenses_by_category)) {
                data.expenses_by_category.forEach(item => {
                    categoriesObj[item.category] = item.total_amount;
                });
            } else if (typeof data.expenses_by_category === 'object' && data.expenses_by_category !== null) {
                categoriesObj = data.expenses_by_category;
            } else if (typeof data === 'object' && data !== null) {
                categoriesObj = data.by_category || data;
            }

            renderCategoryBreakdown(categoriesObj);
        }
    } catch (err) {
        console.error("Error loading analytics:", err);
    }
}

function clearDateFilter() {
    document.getElementById("filterStartDate").value = "";
    document.getElementById("filterEndDate").value = "";
    loadAnalytics();
}

function renderCategoryBreakdown(categories) {
    const list = document.getElementById("categoriesList");
    list.innerHTML = "";

    const labels = Object.keys(categories);
    const values = Object.values(categories);

    if (labels.length === 0 || values.reduce((a, b) => a + b, 0) === 0) {
        list.innerHTML = `<li class="text-gray-500 text-sm italic py-2 text-center">No expenses found...</li>`;
        return;
    }

    labels.forEach(cat => {
        const val = Number(categories[cat]) || 0;
        if (val > 0) {
            list.innerHTML += `
                <li class="flex justify-between items-center py-2 text-sm">
                    <span class="font-medium text-gray-700">${cat}</span>
                    <span class="font-bold text-red-600">€${val.toFixed(2)}</span>
                </li>
            `;
        }
    });
}

// --- TRANSACTIONS FUNCTIONS ---

async function loadTransactions() {
    try {
        const res = await fetch(`${API_URL}/transactions/`, { headers: getAuthHeaders() });
        if (res.ok) {
            const transactions = await res.json();
            const table = document.getElementById("transactionsTable");
            table.innerHTML = "";

            if (transactions.length === 0) {
                table.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500 text-sm italic">No transactions found.</td></tr>`;
                return;
            }

            transactions.forEach(tx => {
                const isIncome = tx.type === "INCOME";
                table.innerHTML += `
                    <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                        <td class="p-3">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${tx.type}
                            </span>
                        </td>
                        <td class="p-3 font-medium text-gray-800">${tx.category}</td>
                        <td class="p-3 text-sm text-gray-600">${tx.date || '-'}</td>
                        <td class="p-3 font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}">
                            ${isIncome ? '+' : '-'}€${tx.amount.toFixed(2)}
                        </td>
                        <td class="p-3 text-right">
                            <button onclick="deleteTransaction(${tx.id})" class="text-red-500 hover:text-red-700 font-medium text-sm transition hover:underline">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Error loading transactions:", err);
    }
}

async function createTransaction(event) {
    event.preventDefault();
    const amount = parseFloat(document.getElementById("txAmount").value);
    const type = document.getElementById("txType").value;
    const category = document.getElementById("txCategory").value;
    const dateVal = document.getElementById("txDate").value;

    const payload = { amount, type, category };
    if (dateVal) payload.date = dateVal;

    try {
        const res = await fetch(`${API_URL}/transactions/`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            document.getElementById("txAmount").value = "";
            document.getElementById("txCategory").value = "";
            setDefaultTxDate();

            await loadAnalytics();
            await loadTransactions();
        } else {
            const err = await res.json();
            alert(err.detail || "Failed to add transaction.");
        }
    } catch (err) {
        console.error("Error creating transaction:", err);
    }
}

async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (res.ok || res.status === 204) {
            await loadAnalytics();
            await loadTransactions();
        } else {
            const err = await res.json();
            alert(err.detail || "Failed to delete transaction.");
        }
    } catch (err) {
        console.error("Error deleting transaction:", err);
        alert("An error occurred while deleting the transaction.");
    }
}