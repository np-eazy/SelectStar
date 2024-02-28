function isColorNotWhite(color) {
  // Assuming color is in the format "rgb(r, g, b)"
  const rgb = color.match(/\d+/g).map(Number);
  // Check if color is not white
  return !(rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255);
}

function modifyColors() {
  const elements = document.querySelectorAll('*');

  elements.forEach(el => {
    const backgroundColor = window.getComputedStyle(el).backgroundColor;
    if (backgroundColor && backgroundColor.startsWith('rgb') && isColorNotWhite(backgroundColor) && el instanceof HTMLElement) {
      el.style.backgroundColor = 'black';
    }

    const color = window.getComputedStyle(el).color;
    if (color && color.startsWith('rgb') && isColorNotWhite(color) && el instanceof HTMLElement) {
      el.style.color = 'black';
    }
  });
}
console.log("HELLO WORLD");

modifyColors();
  // Remember to add cleanup code to remove event listeners if needed
