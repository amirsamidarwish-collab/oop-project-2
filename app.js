/* app.js - connects the user interface to the db.js cost-manager library */

// open (or create) the costs database once when the page loads
const ob = db.openCostsDB('costsdb', 1);

// cache the elements used more than once
const addCostBtn = document.getElementById('addCostBtn');
const reportBtn = document.getElementById('reportBtn');
const categorySelect = document.getElementById('category');
const customCategory = document.getElementById('customCategory');

// show the free-text category box only when "Other" is selected
categorySelect.addEventListener('change', () => {
    customCategory.style.display = categorySelect.value === 'OTHER' ? 'block' : 'none';
});

/* reads the form, validates it and stores a new cost item */
addCostBtn.addEventListener('click', () => {
    const sum = parseFloat(document.getElementById('sum').value);
    const currency = document.getElementById('currency').value;
    const selected = categorySelect.value;
    const description = document.getElementById('description').value.trim();
    const message = document.getElementById('addMessage');

    if (isNaN(sum) || sum <= 0 || currency === '' || selected === '') {
        message.textContent = 'Please enter a valid amount and choose a currency and category.';
        message.style.color = '#dc2626';
        return;
    }

    const category = selected === 'OTHER'
        ? (customCategory.value.trim() || 'Other')
        : selected;

    ob.addCost({ sum, currency, category, description });

    message.textContent = 'Cost added.';
    message.style.color = '#059622';

    document.getElementById('sum').value = '';
    document.getElementById('description').value = '';
    document.getElementById('currency').value = '';
    categorySelect.value = '';
    customCategory.value = '';
    customCategory.style.display = 'none';
});

// builds one table row of HTML for a single cost item
const renderRow = (cost) =>
    `<tr><td>${cost.date.day}</td><td>${cost.category}</td>` +
    `<td>${cost.description}</td><td>${cost.currency}</td><td>${cost.sum}</td></tr>`;

/* reads the selected year / month and shows the matching report */
reportBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('year').value, 10);
    const month = parseInt(document.getElementById('month').value, 10);
    const reportContainer = document.getElementById('reportResult');

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        reportContainer.innerHTML = '<p>Please enter a valid year and month (1-12).</p>';
        return;
    }

    const report = ob.getReport(year, month);

    if (report.costs.length === 0) {
        reportContainer.innerHTML = '<p>No costs found for this month.</p>';
        return;
    }

    const rows = report.costs.map(renderRow).join('');

    reportContainer.innerHTML =
        `<table class="table"><thead><tr><th>Day</th><th>Category</th>` +
        `<th>Description</th><th>Currency</th><th>Sum</th></tr></thead>` +
        `<tbody>${rows}</tbody>` +
        `<tfoot><tr><th colspan="4">Total</th>` +
        `<th>${report.total.sum} ${report.total.currency}</th></tr></tfoot></table>`;
});

// chart instances
let pieChart = null;
let barChart = null;

/* collects the total cost for each category in a selected month and year */
const categoryTotals = (year, month) => {
    const report = ob.getReport(year, month);
    const totals = {};

    report.costs.forEach((cost) => {
        if (!totals[cost.category]) {
            totals[cost.category] = 0;
        }

        totals[cost.category] += cost.sum;
    });

    return totals;
};

/* draws the pie chart for the selected month and year */
const showPieChart = (year, month) => {
    const totals = categoryTotals(year, month);
    const labels = Object.keys(totals);
    const data = Object.values(totals);
    const canvas = document.getElementById('pieChart');

    if (pieChart) {
        pieChart.destroy();
    }

    if (labels.length === 0) {
        return;
    }

    pieChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: `Costs by category ${month}/${year}`,
                data: data
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Costs by Category - ${month}/${year}`
                }
            }
        }
    });
};

const pieChartBtn = document.getElementById('pieChartBtn');

pieChartBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('pieYear').value, 10);
    const month = parseInt(document.getElementById('pieMonth').value, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return;
    }

    showPieChart(year, month);
});

// labels for the twelve months shown on the chart
const monthLabels = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// collects the total cost of each of the twelve months of a year
const monthlyTotals = (year) => {
    const totals = [];

    for (let month = 1; month <= 12; month += 1) {
        totals.push(ob.getReport(year, month).total.sum);
    }

    return totals;
};

/* draws the yearly bar chart for the given year */
const showBarChart = (year) => {
    const totals = monthlyTotals(year);
    const canvas = document.getElementById('barChart');

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: `Total costs in ${year} (USD)`,
                data: totals,
                backgroundColor: '#10B981'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

const barChartBtn = document.getElementById('barChartBtn');

barChartBtn.addEventListener('click', () => {
    const year = parseInt(document.getElementById('barYear').value, 10);

    if (isNaN(year)) {
        return;
    }

    showBarChart(year);
});

// pre-fill the report and chart inputs with the current date
const today = new Date();

document.getElementById('year').value = today.getFullYear();
document.getElementById('month').value = today.getMonth() + 1;
document.getElementById('pieYear').value = today.getFullYear();
document.getElementById('pieMonth').value = today.getMonth() + 1;
document.getElementById('barYear').value = today.getFullYear();