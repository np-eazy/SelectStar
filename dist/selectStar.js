"use strict";
function isColorNotWhite(color) {
    // Assuming color is in the format "rgb(r, g, b)"
    var rgb = color.match(/\d+/g).map(Number);
    // Check if color is not white
    return !(rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255);
}
function modifyColorOfHoveredElement(event) {
    var el = event.target; // The element being hovered over
    // Store original colors
    el.originalBackgroundColor = window.getComputedStyle(el).backgroundColor;
    el.originalColor = window.getComputedStyle(el).color;
    var backgroundColor = el.originalBackgroundColor;
    if (backgroundColor && backgroundColor.startsWith('rgb') && isColorNotWhite(backgroundColor) && el instanceof HTMLElement) {
        el.style.backgroundColor = 'black';
    }
    var color = el.originalColor;
    if (color && color.startsWith('rgb') && isColorNotWhite(color) && el instanceof HTMLElement) {
        el.style.color = 'black';
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
}
console.log("HELLO WORLD");
document.addEventListener('mouseover', modifyColorOfHoveredElement);
document.addEventListener('mouseout', revertColorOfElement);
