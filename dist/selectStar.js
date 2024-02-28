"use strict";
function reduceTable(el, callback) {
    var table = el.closest('table');
    if (callback) {
        var columnNames = Array.from(table.querySelectorAll('thead th')).map(function (th) { return th.textContent.trim(); });
        // Extract table entries
        var rows = table.querySelectorAll('tbody tr');
        var tableEntries = Array.from(rows).map(function (row) {
            return Array.from(row.querySelectorAll('td')).map(function (td) { return td.textContent.trim(); });
        });
        callback(columnNames, tableEntries);
        // console.log(columnNames, tableEntries);
    }
    return table;
}
function modifyColorOfHoveredElement(event) {
    var el = reduceTable(event.target, function (columnNames, tableEntries) { return console.log("ENTERING: ", columnNames, tableEntries); }); // The element being hovered over
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
            el.style.border = isPartOfTable(el) ? '1px solid green' : '1px solid black';
        }
    }
}
function revertColorOfElement(event) {
    var el = reduceTable(event.target, function (columnNames, tableEntries) { return console.log("EXITING: ", columnNames); }); // The element being hovered over
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
