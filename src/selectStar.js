function reduceTable(el, callback) {
  const table = el.closest('table');
  if (true) {
    const columnNames = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

    // Extract table entries
    const rows = table.querySelectorAll('tbody tr');
    const tableEntries = Array.from(rows).map(row => 
      Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
    );
    console.log(columnNames, tableEntries);
  }
  return table;
}

function modifyColorOfHoveredElement(event) {
  const el = reduceTable(event.target); // The element being hovered over

  if (el && el instanceof HTMLElement) {
    // Store original colors
    el.originalBackgroundColor = window.getComputedStyle(el).backgroundColor;
    el.originalColor = window.getComputedStyle(el).color;
    el.originalBorder = window.getComputedStyle(el).border;

    const backgroundColor = el.originalBackgroundColor;
    if (backgroundColor && backgroundColor.startsWith('rgb')) {
      console.log(el);
      el.style.backgroundColor = isPartOfTable(el) ? 'green' : 'white';
    }
    const color = el.originalColor;
    if (color && color.startsWith('rgb')) {
      el.style.color = 'black';
    }
    const border = el.originalBorder;
    if (border) {
      el.style.border = isPartOfTable(el) ? '1px solid green' : '1px solid black';
    }
  }
}


function revertColorOfElement(event) {
  const el = reduceTable(event.target); // The element being hovered over
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
