document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') { // Example: Use Shift key to start selection
      document.body.style.cursor = 'crosshair';
      document.addEventListener('mouseover', highlightElement, false);
      document.addEventListener('click', selectElement, false);
    }
  });
  
  function highlightElement(event) {
    event.target.style.border = '2px solid red'; // Highlight element
  }
  
  function selectElement(event) {
    event.preventDefault();
    event.target.style.border = ''; // Remove highlight
    document.body.style.cursor = ''; // Reset cursor
    document.removeEventListener('mouseover', highlightElement, false);
    document.removeEventListener('click', selectElement, false);
    console.log("selectElement called", event);
    // Now you have the selected element in event.target
    // You can send this information back to your extension or perform other actions
  }
  
  // Remember to add cleanup code to remove event listeners if needed
