"use strict";
function isPartOfTable(el) {
    return (el instanceof HTMLDListElement ||
        el instanceof HTMLDataListElement ||
        el instanceof HTMLOListElement ||
        el instanceof HTMLTableElement ||
        el instanceof HTMLTableRowElement ||
        el instanceof HTMLTableSectionElement);
}
function modifyColorOfHoveredElement(event) {
    var el = event.target; // The element being hovered over
    // Store original colors
    el.originalBackgroundColor = window.getComputedStyle(el).backgroundColor;
    el.originalColor = window.getComputedStyle(el).color;
    el.originalBorder = window.getComputedStyle(el).border;
    var backgroundColor = el.originalBackgroundColor;
    if (backgroundColor && backgroundColor.startsWith('rgb') && el instanceof HTMLElement) {
        console.log(el);
        el.style.backgroundColor = isPartOfTable(el) ? 'green' : 'white';
    }
    var color = el.originalColor;
    if (color && color.startsWith('rgb') && el instanceof HTMLElement) {
        el.style.color = 'black';
    }
    var border = el.originalBorder;
    if (border && el instanceof HTMLElement) {
        el.style.border = isPartOfTable(el) ? '1px solid green' : '1px solid black';
    }
}
function revertColorOfElement(event) {
    var el = event.target; // The element being un-hovered
    // Revert to original colors
    if (el.originalBackgroundColor && el instanceof HTMLElement) {
        el.style.backgroundColor = el.originalBackgroundColor;
    }
    if (el.originalColor && el instanceof HTMLElement) {
        el.style.color = el.originalColor;
    }
    if (el.originalBorder && el instanceof HTMLElement) {
        el.style.border = el.originalBorder;
    }
}
console.log("HELLO WORLD");
document.addEventListener('mouseover', modifyColorOfHoveredElement);
document.addEventListener('mouseout', revertColorOfElement);
