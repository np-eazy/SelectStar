"use strict";
var currentSelectedTable = null; // Holds the current selected table
var currColumn = null;
var currEntries = null;
var sortDxn = null;
var substringFilters = null;
var llmFilters = null;
var prevEntries = null;
var allFilters = new Map();
var allLLMFilters = new Map();
var DIV_NAME = "12346";
function handleSelection(event) {
    var table = event.target.closest('table');
    if (table !== currentSelectedTable) {
        if (!table) {
            allFilters.set(currColumn.toString(), substringFilters);
            currColumn = null;
            currEntries = null;
            sortDxn = null;
            if (currentSelectedTable)
                restoreTable(currentSelectedTable, prevEntries);
            deselectStyle(currentSelectedTable);
            var overlayDiv = document.getElementById(DIV_NAME);
            if (overlayDiv) {
                overlayDiv.parentNode.removeChild(overlayDiv);
            }
            disconnectObserver();
        }
        currentSelectedTable = table;
        if (table) {
            observeTableChanges();
            currColumn = Array.from(table.querySelectorAll('thead th')).map(function (th) { return th.textContent.trim(); });
            // currEntries = Array.from(table.querySelectorAll('tbody tr')).map(row => 
            //   Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
            // );
            currEntries = Array.from(table.querySelectorAll('tbody tr'));
            sortDxn = currColumn.map(function (x) { return false; });
            if (!allFilters.get(currColumn.toString())) {
                allFilters.set(currColumn.toString(), currColumn.map(function (x) { return ""; }));
                allLLMFilters.set(currColumn.toString(), currColumn.map(function (x) { return ""; }));
            }
            substringFilters = allFilters.get(currColumn.toString());
            llmFilters = allLLMFilters.get(currColumn.toString());
            prevEntries = currEntries;
            selectStyle(table);
            sortTable(table);
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
// Function to update currEntries based on the current table
function updateCurrEntries() {
    if (currentSelectedTable) {
        currEntries = Array.from(currentSelectedTable.querySelectorAll('tbody tr'));
    }
}
// MutationObserver callback function
var tableMutationCallback = function (mutationsList, observer) {
    // For simplicity, update currEntries on any mutation. 
    // You might want to filter mutations for more specific changes.
    updateCurrEntries();
};
// Create a MutationObserver instance and pass the callback function
var observer = new MutationObserver(tableMutationCallback);
// Function to start observing the current selected table
function observeTableChanges() {
    if (currentSelectedTable) {
        // Configuration object for the observer
        var config = { childList: true, subtree: true };
        // Start observing the table body for configured mutations
        var tbody = currentSelectedTable.querySelector('tbody');
        if (tbody) {
            observer.observe(tbody, config);
        }
    }
}
// Function to stop observing changes (e.g., when a new table is selected)
function disconnectObserver() {
    observer.disconnect();
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
function sortTable(el, index, reverse) {
    if (index === void 0) { index = -1; }
    if (reverse === void 0) { reverse = false; }
    if (!(el && el.tagName === 'TABLE'))
        return;
    var tbody = el.querySelector('tbody');
    if (!tbody)
        return;
    // TODO: use caching to make this faster if we know the new operation strictly removes currently displayed items
    var rows = currEntries.map(function (tr) { return tr.cloneNode(true); });
    for (var k = 0; k < substringFilters.length; k++) {
        if (substringFilters[k] !== "") {
            var substrings = substringFilters[k].split(' ');
            console.log(substrings);
            var _loop_1 = function (substring) {
                if (substring[0] == '-') {
                    rows = rows.filter(function (row) {
                        var _a;
                        return !((_a = row.querySelectorAll('td')[k]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase().includes(substring.slice(1, substring.length).toLowerCase()));
                    });
                }
                else {
                    rows = rows.filter(function (row) {
                        var _a;
                        return (_a = row.querySelectorAll('td')[k]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase().includes(substring.toLowerCase());
                    });
                }
            };
            for (var _i = 0, substrings_1 = substrings; _i < substrings_1.length; _i++) {
                var substring = substrings_1[_i];
                _loop_1(substring);
            }
        }
    }
    if (index != -1) {
        rows.sort(function (a, b) {
            var _a, _b;
            var aValue = (_a = a.querySelectorAll('td')[index]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase();
            var bValue = (_b = b.querySelectorAll('td')[index]) === null || _b === void 0 ? void 0 : _b.textContent.trim().toLowerCase();
            return aValue.localeCompare(bValue);
        });
    }
    // Clear the tbody before appending sorted rows
    tbody.innerHTML = '';
    if (reverse) {
        rows = rows.reverse();
    }
    rows.forEach(function (row) { return tbody.appendChild(row); }); // Append all items that match the criteria
}
function filterPanel(table, overlayDiv, i) {
    // Make sure you pass in a const for i!
    var columnDiv = document.createElement('div');
    columnDiv.style.cssText = "background-color: white; height: 250px; margin: 10px; margin-right: 0px; position: sticky; top: 0; z-index: 1000; background-color: inherit;";
    var columnName = currColumn[i];
    // Create an h3 element for the column name
    var columnTitle = document.createElement('p');
    columnTitle.textContent = columnName;
    columnTitle.style.cssText = 'text-align: center; margin-bottom: 10px'; // Center the column name
    // Append the h3 element to the columnDiv
    columnDiv.appendChild(columnTitle);
    // Create an input field
    var filterField = document.createElement('input');
    // Set input field properties
    filterField.type = 'text';
    filterField.placeholder = 'Keyphrase Filter...';
    filterField.style.cssText = 'width: 100%; padding: 10px;'; // Style the input field
    filterField.value = substringFilters[i];
    filterField.addEventListener('input', function () {
        // Call sortTable with the current value of the input field
        substringFilters[i] = this.value;
        sortTable(table, i);
    });
    columnDiv.appendChild(filterField);
    var llmField = document.createElement('input');
    llmField.type = 'textarea';
    llmField.placeholder = 'AI Filter...';
    llmField.style.cssText = 'width: 100%; height: 50%;'; // Style the input field
    llmField.value = llmFilters[i];
    llmField.addEventListener('input', function () {
        // Call sortTable with the current value of the input field
        llmFilters[i] = this.value;
    });
    // Append the input field to the columnDiv
    columnDiv.appendChild(llmField);
    // Create a button
    var filterButton = document.createElement('button');
    filterButton.textContent = 'Sort & Filter';
    filterButton.style.cssText = 'margin: 10px; margin-right: 0px; background-color: #000000; color: white; padding: 10px;'; // Style the button
    // Append the button to the columnDiv
    columnDiv.appendChild(filterButton);
    // Attach a click event listener to the button
    filterButton.addEventListener('click', function () {
        // Call sortTable with the current value of the input field when the button is clicked
        sortTable(table, i, sortDxn[i]);
    });
    // Create the sort and reverse button
    var sortReverseButton = document.createElement('button');
    sortReverseButton.textContent = 'Reverse';
    sortReverseButton.style.cssText = 'margin: 10px; border: 1px solid black; color: black; padding: 10px;'; // Style the button
    // Append the sort and reverse button to the columnDiv
    columnDiv.appendChild(sortReverseButton);
    // Attach a click event listener to the sort and reverse button
    sortReverseButton.addEventListener('click', function () {
        // Assuming sortTable can sort, you might need a separate function to reverse
        sortDxn[i] = !sortDxn[i];
        sortTable(table, i, sortDxn[i]);
    });
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
