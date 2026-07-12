# Cost Manager

A browser-based expense tracker built for the OOP Project 2 assignment. It
stores costs locally, produces monthly reports, and visualizes spending by
category and month. No server, account, or installation is required.

## Features

- Add an expense with amount, currency, category, and optional description.
- Use predefined categories or enter a custom category.
- View a detailed monthly report and total.
- Display monthly category totals as a pie chart.
- Display all twelve monthly totals as a yearly bar chart.
- Keep data between browser sessions with `localStorage`.
- Responsive layout for desktop and mobile screens.

## Run the application

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Add a cost, then use the report and chart panels to review it.

An internet connection is required on first load for the Bootstrap and Chart.js
files provided by their public CDNs. Expense data itself remains in the
browser.

## How to use it

### Add a cost

Enter a positive amount, choose USD and a category, optionally add a
description, and select **Add Cost**. Choosing **Other** reveals a custom
category field.

### View a monthly report

Enter a year and a month from 1 to 12, then select **Get Report**. The table
shows the matching expenses and their total.

### View charts

- **Category Pie Chart** shows spending totals by category for one month.
- **Yearly Bar Chart** shows the total for every month of a selected year.

## Project structure

```text
oop-project-2/
|-- index.html   Application markup and external library links
|-- style.css    Responsive layout and visual design
|-- app.js       Form handling, validation, reports, and charts
|-- db.js        Cost database API backed by browser localStorage
`-- README.md    Project documentation
```

## Database API

`db.js` exposes the assignment API through the global `db` object:

```javascript
const costs = db.openCostsDB('costsdb', 1);

costs.addCost({
  sum: 25,
  currency: 'USD',
  category: 'FOOD',
  description: 'Lunch'
});

const report = costs.getReport(2026, 7);
```

Each stored cost receives the current date automatically. `getReport(year,
month)` returns matching costs plus a USD total.

## Data and privacy

Costs are saved only in the current browser under a `localStorage` key beginning
with `costsdb:`. The application does not send expense records to a backend.
Clearing browser site data, using a different browser, or using a different
device will result in a separate empty database.

## Technology

- HTML5
- CSS3 and Bootstrap 5.3
- Vanilla JavaScript
- Chart.js 4.4
- Browser `localStorage`

## Development notes

There is no build step or package installation. Edit the source files and
refresh `index.html` in the browser. Browser developer tools can be used to
inspect the `costsdb:*` local-storage entries and debug the UI.

Current scope uses USD only and records the date when an expense is added.
