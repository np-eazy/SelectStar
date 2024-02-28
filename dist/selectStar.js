"use strict";
var currentSelectedTable = null; // Holds the current selected table
var currColumn = null;
var currEntries = null;
var DIV_NAME = "12346";
function handleSelection(event) {
    var table = event.target.closest('table');
    if (table !== currentSelectedTable) {
        if (!table) {
            console.log("DE-SELECTING");
            currColumn = null;
            currEntries = null;
            deselectStyle(currentSelectedTable);
            var overlayDiv = document.getElementById(DIV_NAME);
            if (overlayDiv) {
                overlayDiv.parentNode.removeChild(overlayDiv);
            }
        }
        currentSelectedTable = table;
        if (table) {
            currColumn = Array.from(table.querySelectorAll('thead th')).map(function (th) { return th.textContent.trim(); });
            currEntries = Array.from(table.querySelectorAll('tbody tr')).map(function (row) {
                return Array.from(row.querySelectorAll('td')).map(function (td) { return td.textContent.trim(); });
            });
            console.log("SELECTED: ", currColumn, currEntries);
            selectStyle(table);
            sortTable(table);
            // Create a new div element
            var overlayDiv = document.createElement('div');
            // Set the div's styles
            overlayDiv.style.cssText = 'border: 1px solid black; background-color: white; height: 200px; width: 100%;';
            // Set a unique ID for the div
            overlayDiv.id = DIV_NAME;
            // Create a new tr element
            var overlayTr = document.createElement('tr');
            // Create a new td element
            var overlayTd = document.createElement('td');
            // Set the colspan attribute to match the number of columns
            var colCount = table.querySelectorAll('thead th').length || table.querySelectorAll('tbody tr:first-child td').length;
            overlayTd.setAttribute('colspan', colCount.toString());
            // Append the div to the td, and the td to the tr
            overlayTd.appendChild(overlayDiv);
            overlayTr.appendChild(overlayTd);
            // Find the table's header (thead) element
            var thead = table.querySelector('thead');
            if (thead) {
                // Insert the tr right after the table's header (thead)
                thead.parentNode.insertBefore(overlayTr, thead.nextSibling);
            }
            else {
                // If there's no thead, insert the tr at the beginning of the table
                table.insertBefore(overlayTr, table.firstChild);
            }
        }
    }
}
function deselectStyle(el) {
    if (!el)
        return; // Guard clause to ensure el is not null
    el.style.setProperty('border-style', el.originalBorderStyle || '', 'important');
    el.style.setProperty('border-width', el.originalBorderWidth || '', 'important');
    el.style.setProperty('border-color', el.originalBorderColor || '', 'important');
}
function selectStyle(el) {
    if (!el)
        return; // Guard clause to ensure el is not null
    var style = window.getComputedStyle(el);
    // Store original styles with fallback to current style if original not defined
    el.originalBorderStyle = style.getPropertyValue('border-style');
    el.originalBorderWidth = style.getPropertyValue('border-width');
    el.originalBorderColor = style.getPropertyValue('border-color');
    el.style.setProperty('border-style', 'solid', 'important');
    el.style.setProperty('border-width', '2px', 'important');
    el.style.setProperty('border-color', 'green', 'important');
}
function sortTable(el) {
    if (!(el && el.tagName === 'TABLE'))
        return;
    var tbody = el.querySelector('tbody');
    if (!tbody)
        return;
    var rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort(function (a, b) {
        var aValue = a.cells[0].textContent.trim().toLowerCase();
        var bValue = b.cells[0].textContent.trim().toLowerCase();
        return aValue.localeCompare(bValue);
    });
    rows.forEach(function (row) { return tbody.appendChild(row); });
}
document.addEventListener('mousedown', handleSelection);
