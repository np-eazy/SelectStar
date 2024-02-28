"use strict";
var currentSelectedTable = null; // Holds the current selected table
var currColumn = null;
var currEntries = null;
function sortTable(el) {
    // Ensure the element is a table
    if (!(el && el.tagName === 'TABLE'))
        return;
    var tbody = el.querySelector('tbody');
    if (!tbody)
        return; // If there's no tbody, exit the function
    // Convert the NodeList of rows to an array for sorting
    var rows = Array.from(tbody.querySelectorAll('tr'));
    // Sort the rows based on the text content of the first cell in each row
    rows.sort(function (a, b) {
        var aValue = a.cells[0].textContent.trim().toLowerCase();
        var bValue = b.cells[0].textContent.trim().toLowerCase();
        return aValue.localeCompare(bValue);
    });
    // Re-append rows to the tbody in sorted order
    rows.forEach(function (row) { return tbody.appendChild(row); });
    console.log("TABLE SORTED");
}
function reduceTable(el, callback) {
    var table = el.closest('table');
    if (table !== currentSelectedTable) {
        currentSelectedTable = table; // Update the current selected table
        if (callback && table) {
            currColumn = Array.from(table.querySelectorAll('thead th')).map(function (th) { return th.textContent.trim(); });
            currEntries = Array.from(table.querySelectorAll('tbody tr')).map(function (row) {
                return Array.from(row.querySelectorAll('td')).map(function (td) { return td.textContent.trim(); });
            });
            sortTable(el);
            callback(currColumn, currEntries);
        }
        if (!table) {
            console.log("EXITING: ", currColumn);
            currColumn = null;
            currEntries = null;
            revertColorOfElement(currentSelectedTable);
        }
        return table; // Return the new table
    }
    return null; // Return null if it's the same table or no table is found
}
function modifyColorOfHoveredElement(event) {
    var el = reduceTable(event.target, function (columnNames, tableEntries) {
        console.log("ENTERING: ", columnNames, tableEntries);
    });
    if (el && el instanceof HTMLElement) {
        // Store original colors
        el.originalBackgroundColor = window.getComputedStyle(el).backgroundColor;
        el.originalColor = window.getComputedStyle(el).color;
        el.originalBorder = window.getComputedStyle(el).border;
        var backgroundColor = el.originalBackgroundColor;
        if (backgroundColor && backgroundColor.startsWith('rgb')) {
            console.log(el);
            el.style.backgroundColor = 'green';
        }
        var color = el.originalColor;
        if (color && color.startsWith('rgb')) {
            el.style.color = 'black';
        }
        var border = el.originalBorder;
        if (border) {
            el.style.border = '1px solid green';
        }
    }
}
function revertColorOfElement(el) {
    if (el && el instanceof HTMLElement) {
        // Revert to original colors
        if (el.originalBackgroundColor) {
            el.style.backgroundColor = el.originalBackgroundColor;
        }
        if (el.originalColor) {
            el.style.color = el.originalColor;
        }
        if (el.originalBorder) {
            el.style.border = el.originalBorder;
        }
    }
}
console.log("HELLO WORLD");
document.addEventListener('mouseover', modifyColorOfHoveredElement);
document.addEventListener('mouseout', revertColorOfElement);
