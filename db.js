/* db.js - Cost Manager data-access library backed by localStorage */

(function (global) {
    'use strict';

    // database used when calling db.addCost / db.getReport directly
    const DEFAULT_DB = 'costsdb';

    // builds the localStorage key that holds the items of a database
    const storageKey = (databaseName) => 'costsdb:' + databaseName;

    // reads the stored cost items, returning an empty array when none exist
    const readCosts = (databaseName) => {
        const raw = localStorage.getItem(storageKey(databaseName));
        return raw ? JSON.parse(raw) : [];
    };

    // persists the cost items array back to localStorage
    const writeCosts = (databaseName, costs) => {
        localStorage.setItem(storageKey(databaseName), JSON.stringify(costs));
    };

    /* adds a new cost item and returns it (sum, currency, category, description) */
    const addCost = (databaseName, cost) => {
        // the attached date is the moment the item is added
        const now = new Date();
        const item = {
            sum: Number(cost.sum),
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            // getMonth() is zero-based, so add 1 for a human month
            date: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate()
            }
        };
        // load the items, append the new one and save back
        const costs = readCosts(databaseName);
        costs.push(item);
        writeCosts(databaseName, costs);
        // return only the four properties required by the specification
        return {
            sum: item.sum,
            currency: item.currency,
            category: item.category,
            description: item.description
        };
    };

    /* builds a detailed report for a given year and month */
    const getReport = (databaseName, year, month) => {
        // keep only the items that belong to the requested month and year
        const items = readCosts(databaseName).filter(
            (item) => item.date.year === year && item.date.month === month
        );
        // map every item to the report shape (date reduced to the day)
        const costs = items.map((item) => ({
            sum: item.sum,
            currency: item.currency,
            category: item.category,
            description: item.description,
            date: { day: item.date.day }
        }));
        // sum the amounts to produce the total
        const total = costs.reduce((sum, item) => sum + item.sum, 0);
        return {
            year: year,
            month: month,
            costs: costs,
            total: { currency: 'USD', sum: total }
        };
    };

    // opens (or creates) a costs database and returns an object bound to it
    const openCostsDB = (databaseName, version) => {
        const name = databaseName || DEFAULT_DB;
        // the returned object exposes methods bound to this database name
        return {
            name: name,
            version: version,
            addCost: (cost) => addCost(name, cost),
            getReport: (year, month) => getReport(name, year, month)
        };
    };

    // expose the db library on the global object (required by the assignment)
    global.db = {
        openCostsDB: openCostsDB,
        addCost: (cost) => addCost(DEFAULT_DB, cost),
        getReport: (year, month) => getReport(DEFAULT_DB, year, month)
    };
}(this));
