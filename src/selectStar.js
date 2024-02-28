let currentSelectedTable = null; // Holds the current selected table
let currColumn = null;
let currEntries = null;
function reduceTable(el, callback) {
  const table = el.closest('table');
  if (table !== currentSelectedTable) {
    currentSelectedTable = table; // Update the current selected table
    
    if (callback && table) {
      currColumn = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      currEntries = Array.from(table.querySelectorAll('tbody tr')).map(row => 
        Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
      );
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
  const el = reduceTable(event.target, (columnNames, tableEntries) => console.log("ENTERING: ", columnNames, tableEntries));
  if (el && el instanceof HTMLElement) {
    // Store original colors
    el.originalBackgroundColor = window.getComputedStyle(el).backgroundColor;
    el.originalColor = window.getComputedStyle(el).color;
    el.originalBorder = window.getComputedStyle(el).border;

    const backgroundColor = el.originalBackgroundColor;
    if (backgroundColor && backgroundColor.startsWith('rgb')) {
      console.log(el);
      el.style.backgroundColor = 'green';
    }
    const color = el.originalColor;
    if (color && color.startsWith('rgb')) {
      el.style.color = 'black';
    }
    const border = el.originalBorder;
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
