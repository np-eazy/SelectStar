let currentSelectedTable = null; // Holds the current selected table
let currColumn = null;
let currEntries = null;
let sortDxn = null;

let substringFilters = null;
let llmFilters = null;

let prevEntries = null;
let allFilters = new Map();
let allLLMFilters = new Map();

const DIV_NAME = "12346";
function handleSelection(event) {
  const table = event.target.closest('table');
  if (table !== currentSelectedTable) {
    if (!table) {
      allFilters.set(currColumn.toString(), substringFilters);
      currColumn = null;
      currEntries = null;
      sortDxn = null;
      if (currentSelectedTable) restoreTable(currentSelectedTable, prevEntries);
      deselectStyle(currentSelectedTable);

      const overlayDiv = document.getElementById(DIV_NAME);
      if (overlayDiv) {
        overlayDiv.parentNode.removeChild(overlayDiv);
      }
      disconnectObserver();
    }
    currentSelectedTable = table;
    if (table) {
      observeTableChanges()
      currColumn = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      // currEntries = Array.from(table.querySelectorAll('tbody tr')).map(row => 
      //   Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
      // );
      currEntries = Array.from(table.querySelectorAll('tbody tr'));
      sortDxn = currColumn.map((x) => false);
      if (!allFilters.get(currColumn.toString())) {
        allFilters.set(currColumn.toString(), currColumn.map((x) => ""));
        allLLMFilters.set(currColumn.toString(), currColumn.map((x) => ""));
      }
      substringFilters = allFilters.get(currColumn.toString());
      llmFilters = allLLMFilters.get(currColumn.toString());
      prevEntries = currEntries;
      selectStyle(table);
      sortTable(table);
    
      // Create the main overlay div
      const overlayDiv = document.createElement('div');
      overlayDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 0 4px;';
    
      // Set a unique ID for the main overlay div
      overlayDiv.id = DIV_NAME;
    
      // Calculate the number of columns
      const colCount = currColumn.length;
    
      // Create and append a div for each column
      for (var i = 0; i < colCount; i++) {
        // Append the column div to the overlay div
        overlayDiv.appendChild(filterPanel(table, overlayDiv, i));
      }

      // Adjust the first and last column div margin
      if (overlayDiv.firstChild) overlayDiv.firstChild.style.marginLeft = '0';
      if (overlayDiv.lastChild) overlayDiv.lastChild.style.marginRight = '0';
    
      // Create a new tr element
      const overlayTr = document.createElement('tr');
      // Create a new td element with colspan to span all columns
      const overlayTd = document.createElement('td');
      overlayTd.setAttribute('colspan', colCount.toString());
    
      // Append the main overlay div to the td, and the td to the tr
      overlayTd.appendChild(overlayDiv);
      overlayTr.appendChild(overlayTd);
    
      // Find the table's header (thead) element
      const thead = table.querySelector('thead');
      if (thead) {
        // Insert the tr right after the table's header (thead)
        thead.parentNode.insertBefore(overlayTr, thead.nextSibling);
      } else {
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
const tableMutationCallback = function(mutationsList, observer) {
  // For simplicity, update currEntries on any mutation. 
  // You might want to filter mutations for more specific changes.
  updateCurrEntries();
};

// Create a MutationObserver instance and pass the callback function
const observer = new MutationObserver(tableMutationCallback);

// Function to start observing the current selected table
function observeTableChanges() {
  if (currentSelectedTable) {
    // Configuration object for the observer
    const config = { childList: true, subtree: true };

    // Start observing the table body for configured mutations
    const tbody = currentSelectedTable.querySelector('tbody');
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
  if (!el) return; // Guard clause to ensure el is not null
  el.style.setProperty('border-style', el.originalBorderStyle || '', 'important');
  el.style.setProperty('border-width', el.originalBorderWidth || '', 'important');
  el.style.setProperty('border-color', el.originalBorderColor || '', 'important');
}

function selectStyle(el) {
  if (!el) return; // Guard clause to ensure el is not null
  const style = window.getComputedStyle(el);
  // Store original styles with fallback to current style if original not defined
  el.originalBorderStyle = style.getPropertyValue('border-style');
  el.originalBorderWidth = style.getPropertyValue('border-width');
  el.originalBorderColor = style.getPropertyValue('border-color');

  el.style.setProperty('border-style', 'solid', 'important');
  el.style.setProperty('border-width', '2px', 'important');
  el.style.setProperty('border-color', 'green', 'important');
}

function sortTable(el, index=-1, reverse=false) {
  if (!(el && el.tagName === 'TABLE')) return;
  let tbody = el.querySelector('tbody');
  if (!tbody) return;

  // TODO: use caching to make this faster if we know the new operation strictly removes currently displayed items
  let rows = currEntries.map(tr => tr.cloneNode(true));
  for (var k = 0; k < substringFilters.length; k++) {    
    if (substringFilters[k] !== "") {
      const substrings = substringFilters[k].split(' ');
      console.log(substrings);
      for (const substring of substrings) {
        if (substring[0] == '-') {
          rows = rows.filter(row => {
            return !row.querySelectorAll('td')[k]?.textContent.trim().toLowerCase().includes(substring.slice(1, substring.length).toLowerCase())
          });
        } else {
          rows = rows.filter(row => {
            return row.querySelectorAll('td')[k]?.textContent.trim().toLowerCase().includes(substring.toLowerCase())
          });
        }
      }
    }
  }
  if (index != -1) {
    rows.sort((a, b) => {
      const aValue = a.querySelectorAll('td')[index]?.textContent.trim().toLowerCase();
      const bValue = b.querySelectorAll('td')[index]?.textContent.trim().toLowerCase();
      return aValue.localeCompare(bValue);
    });
  }
  
  // Clear the tbody before appending sorted rows
  tbody.innerHTML = '';
  if (reverse) {
    rows = rows.reverse();
  }
  rows.forEach(row => tbody.appendChild(row)); // Append all items that match the criteria
}


function filterPanel(table, overlayDiv, i) {
  // Make sure you pass in a const for i!
  const columnDiv = document.createElement('div');
  columnDiv.style.cssText = `background-color: white; height: 250px; margin: 10px; margin-right: 0px; position: sticky; top: 0; z-index: 1000; background-color: inherit;`;

  const columnName = currColumn[i];

  // Create an h3 element for the column name
  const columnTitle = document.createElement('p');
  columnTitle.textContent = columnName;
  columnTitle.style.cssText = 'text-align: center; margin-bottom: 10px'; // Center the column name

  // Append the h3 element to the columnDiv
  columnDiv.appendChild(columnTitle);

  // Create an input field
  const filterField = document.createElement('input');  
  // Set input field properties
  filterField.type = 'text';
  filterField.placeholder = 'Keyphrase Filter...';
  filterField.style.cssText = 'width: 100%; padding: 10px;'; // Style the input field
  filterField.value = substringFilters[i];
  filterField.addEventListener('input', function() {
    // Call sortTable with the current value of the input field
    substringFilters[i] = this.value;
    sortTable(table, i);
  });
  columnDiv.appendChild(filterField);

  const llmField = document.createElement('input');
  llmField.type = 'textarea';
  llmField.placeholder = 'AI Filter...';
  llmField.style.cssText = 'width: 100%; height: 50%;'; // Style the input field
  llmField.value = llmFilters[i];
  llmField.addEventListener('input', function() {
    // Call sortTable with the current value of the input field
    llmFilters[i] = this.value;
  });
  // Append the input field to the columnDiv
  columnDiv.appendChild(llmField);  

  // Create a button
  const filterButton = document.createElement('button');
  filterButton.textContent = 'Sort & Filter';
  filterButton.style.cssText = 'margin: 10px; margin-right: 0px; background-color: #000000; color: white; padding: 10px;'; // Style the button

  // Append the button to the columnDiv
  columnDiv.appendChild(filterButton);

  // Attach a click event listener to the button
  filterButton.addEventListener('click', function() {
    // Call sortTable with the current value of the input field when the button is clicked
    sortTable(table, i, sortDxn[i]);
  });

    // Create the sort and reverse button
    const sortReverseButton = document.createElement('button');
    sortReverseButton.textContent = 'Reverse';
    sortReverseButton.style.cssText = 'margin: 10px; border: 1px solid black; color: black; padding: 10px;'; // Style the button
  
    // Append the sort and reverse button to the columnDiv
    columnDiv.appendChild(sortReverseButton);
  
    // Attach a click event listener to the sort and reverse button
    sortReverseButton.addEventListener('click', function() {
      // Assuming sortTable can sort, you might need a separate function to reverse
      sortDxn[i] = !sortDxn[i];
      sortTable(table, i, sortDxn[i]);
    });

  return columnDiv;
}

function restoreTable(table, prevEntries) {
  if (!table || !prevEntries) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  // Clear current tbody
  tbody.innerHTML = '';

  // Repopulate tbody with prevEntries, which are tr elements
  prevEntries.forEach(tr => {
    // Clone the tr element to avoid issues with reappending elements already in the DOM
    const clonedTr = tr.cloneNode(true);
    tbody.appendChild(clonedTr);
  });
}

document.addEventListener('mousedown', handleSelection);
