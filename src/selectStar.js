let currentSelectedTable = null; // Holds the current selected table
let currColumn = null;
let currEntries = null;
const DIV_NAME = "12346";
function handleSelection(event) {
  const table = event.target.closest('table');
  if (table !== currentSelectedTable) {
    if (!table) {
      console.log("DE-SELECTING");
      currColumn = null;
      currEntries = null;
      deselectStyle(currentSelectedTable);

      const overlayDiv = document.getElementById(DIV_NAME);
      if (overlayDiv) {
        overlayDiv.parentNode.removeChild(overlayDiv);
      }
    }
    currentSelectedTable = table;
    if (table) {
      currColumn = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      currEntries = Array.from(table.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
      );
      console.log("SELECTED: ", currColumn, currEntries);
      selectStyle(table);
      // sortTable(table);
    
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

function sortTable(el, index=0) {
  console.log(index);
  if (!(el && el.tagName === 'TABLE')) return;
  let tbody = el.querySelector('tbody');
  if (!tbody) return;

  let rows = Array.from(tbody.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const aValue = a.cells[index].textContent.trim().toLowerCase();
    const bValue = b.cells[index].textContent.trim().toLowerCase();
    return aValue.localeCompare(bValue);
  });
  rows.forEach(row => tbody.appendChild(row));
}



function filterPanel(table, overlayDiv, i) {
  const columnDiv = document.createElement('div');
  columnDiv.style.cssText = `flex: 1; border: 1px solid black; background-color: white; height: 200px; margin: 0 4px;`;
  overlayDiv.style.transition = 'background-color 0.3s'; // Smooth transition for the hover effect
  const j = i;
  columnDiv.onmouseover = function() { 
      this.style.backgroundColor = 'gray';
      sortTable(table, j);
  };
  columnDiv.onmouseout = function() { this.style.backgroundColor = 'white'; };
  return columnDiv;
}






document.addEventListener('mousedown', handleSelection);
