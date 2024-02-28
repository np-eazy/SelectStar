let currentSelectedTable = null; // Holds the current selected table
let currColumn = null;
let currEntries = null;

function handleSelection(event) {
  const table = event.target.closest('table');
  if (table !== currentSelectedTable) {
    if (!table) {
      console.log("DE-SELECTING");
      currColumn = null;
      currEntries = null;
      deselectStyle(currentSelectedTable);
    }
    currentSelectedTable = table;
    if (table) {
      currColumn = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      currEntries = Array.from(table.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
      );
      console.log("SELECTED: ", currColumn, currEntries);
      selectStyle(table);
      sortTable(table);
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

function sortTable(el) {
  if (!(el && el.tagName === 'TABLE')) return;
  let tbody = el.querySelector('tbody');
  if (!tbody) return;

  let rows = Array.from(tbody.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const aValue = a.cells[0].textContent.trim().toLowerCase();
    const bValue = b.cells[0].textContent.trim().toLowerCase();
    return aValue.localeCompare(bValue);
  });
  rows.forEach(row => tbody.appendChild(row));
}

document.addEventListener('mousedown', handleSelection);
