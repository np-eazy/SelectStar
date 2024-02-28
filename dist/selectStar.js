"use strict";
var currentSelectedTable = null; // Holds the current selected table
var currColumn = null;
var currEntries = null;
var substringFilters = null;
var prevEntries = null;
var DIV_NAME = "12346";
function handleSelection(event) {
    var table = event.target.closest('table');
    if (table !== currentSelectedTable) {
        if (!table) {
            currColumn = null;
            currEntries = null;
            substringFilters = null;
            if (currentSelectedTable)
                restoreTable(currentSelectedTable, prevEntries);
            deselectStyle(currentSelectedTable);
            var overlayDiv = document.getElementById(DIV_NAME);
            if (overlayDiv) {
                overlayDiv.parentNode.removeChild(overlayDiv);
            }
        }
        currentSelectedTable = table;
        if (table) {
            currColumn = Array.from(table.querySelectorAll('thead th')).map(function (th) { return th.textContent.trim(); });
            // currEntries = Array.from(table.querySelectorAll('tbody tr')).map(row => 
            //   Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
            // );
            currEntries = Array.from(table.querySelectorAll('tbody tr'));
            substringFilters = currColumn.map(function (x) { return ""; });
            prevEntries = currEntries;
            selectStyle(table);
            // sortTable(table);
            // Create the main overlay div
            var overlayDiv = document.createElement('div');
            overlayDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 0 4px;';
            // Set a unique ID for the main overlay div
            overlayDiv.id = DIV_NAME;
            // Calculate the number of columns
            var colCount = currColumn.length;
            // Create and append a div for each column
            for (var i = 0; i < colCount; i++) {
                // Append the column div to the overlay div
                overlayDiv.appendChild(filterPanel(table, overlayDiv, i));
            }
            // Adjust the first and last column div margin
            if (overlayDiv.firstChild)
                overlayDiv.firstChild.style.marginLeft = '0';
            if (overlayDiv.lastChild)
                overlayDiv.lastChild.style.marginRight = '0';
            // Create a new tr element
            var overlayTr = document.createElement('tr');
            // Create a new td element with colspan to span all columns
            var overlayTd = document.createElement('td');
            overlayTd.setAttribute('colspan', colCount.toString());
            // Append the main overlay div to the td, and the td to the tr
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
function sortTable(el, index) {
    if (index === void 0) { index = 0; }
    if (!(el && el.tagName === 'TABLE'))
        return;
    var tbody = el.querySelector('tbody');
    if (!tbody)
        return;
    // TODO: use caching to make this faster if we know the new operation strictly removes currently displayed items
    var rows = currEntries.map(function (tr) { return tr.cloneNode(true); });
    var _loop_1 = function () {
        var substring = substringFilters[k];
        if (substring !== "") {
            rows = rows.filter(function (row) { var _a; return (_a = row.querySelectorAll('td')[k]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase().includes(substring.toLowerCase()); });
        }
    };
    for (var k = 0; k < substringFilters.length; k++) {
        _loop_1();
    }
    rows.sort(function (a, b) {
        var _a, _b;
        var aValue = (_a = a.querySelectorAll('td')[index]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase();
        var bValue = (_b = b.querySelectorAll('td')[index]) === null || _b === void 0 ? void 0 : _b.textContent.trim().toLowerCase();
        return aValue.localeCompare(bValue);
    });
    // Clear the tbody before appending sorted rows
    tbody.innerHTML = '';
    rows.forEach(function (row) { return tbody.appendChild(row); }); // Append all items that match the criteria
}
function filterPanel(table, overlayDiv, i) {
    // Make sure you pass in a const for i!
    var columnDiv = document.createElement('div');
    columnDiv.style.cssText = "flex: 1; border: 1px solid black; background-color: white; height: 200px; margin: 0 4px;";
    overlayDiv.style.transition = 'background-color 0.3s'; // Smooth transition for the hover effect
    // Create an input field
    var inputField = document.createElement('input');
    // Set input field properties
    inputField.type = 'text';
    inputField.placeholder = 'Filter...';
    inputField.style.cssText = 'width: 100%; margin-bottom: 10px;'; // Style the input field
    // Append the input field to the columnDiv
    columnDiv.appendChild(inputField);
    // Use the 'input' event to trigger sorting whenever the input value changes
    inputField.addEventListener('input', function () {
        // Call sortTable with the current value of the input field
        substringFilters[i] = this.value;
        sortTable(table, i);
    });
    // Adjusted event listeners for styling purposes (optional)
    columnDiv.onmouseover = function () {
        sortTable(table, i, this.value);
        this.style.backgroundColor = 'gray';
    };
    columnDiv.onmouseout = function () {
        this.style.backgroundColor = 'white';
    };
    return columnDiv;
}
function restoreTable(table, prevEntries) {
    if (!table || !prevEntries)
        return;
    var tbody = table.querySelector('tbody');
    if (!tbody)
        return;
    // Clear current tbody
    tbody.innerHTML = '';
    // Repopulate tbody with prevEntries, which are tr elements
    prevEntries.forEach(function (tr) {
        // Clone the tr element to avoid issues with reappending elements already in the DOM
        var clonedTr = tr.cloneNode(true);
        tbody.appendChild(clonedTr);
    });
}
document.addEventListener('mousedown', handleSelection);
