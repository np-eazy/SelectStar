export function filterPanel(i) {
    var columnDiv = document.createElement('div');
    columnDiv.style.cssText = "flex: 1; border: 1px solid black; background-color: white; height: 200px; margin: 0 4px;";
    overlayDiv.style.transition = 'background-color 0.3s'; // Smooth transition for the hover effect
    var j = i;
    columnDiv.onmouseover = function () {
        this.style.backgroundColor = 'gray';
        sortTable(table, j);
    };
    columnDiv.onmouseout = function () { this.style.backgroundColor = 'white'; };
    return columnDiv;
}
