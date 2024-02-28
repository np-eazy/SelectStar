
let currentSelectedTable = null; // Holds the current selected table
let currEntries = null; // 2d array view
let prevEntries = null; // spare pointer

let currColumn = null;
let sortDxn = null;
let substringFilters = null;
let llmFilters = null;

let allFilters = new Map(); // Persistent user input
let allLLMFilters = new Map();

const DIV_NAME = "selectStar";
let openaiKey = "sk-XkpG62CN8vaLV9EyXlhUT"; 
openaiKey += "3BlbkFJyxs43ffIH67BLH8mdBZF";
const CHUNK_SIZE = 128;
const CAP = 512;

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
      observeTableChanges();
      currColumn = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
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
    
      const overlayDiv = document.createElement('div');
      overlayDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 0 4px;';
      overlayDiv.id = DIV_NAME;
      const colCount = currColumn.length;
      for (var i = 0; i < colCount; i++) {
        overlayDiv.appendChild(filterPanel(table, overlayDiv, i));
      }
      if (overlayDiv.firstChild) overlayDiv.firstChild.style.marginLeft = '0';
      if (overlayDiv.lastChild) overlayDiv.lastChild.style.marginRight = '0';
    
      const overlayTr = document.createElement('tr');
      const overlayTd = document.createElement('td');
      overlayTd.setAttribute('colspan', colCount.toString());    
      overlayTd.appendChild(overlayDiv);
      overlayTr.appendChild(overlayTd);
    
      const thead = table.querySelector('thead');
      if (thead) {
        thead.parentNode.insertBefore(overlayTr, thead.nextSibling);
      } else {
        table.insertBefore(overlayTr, table.firstChild);
      }
    }
  }
}

function filterPanel(table, overlayDiv, i) {
  // Make sure you pass in a const for i!
  const columnDiv = document.createElement('div');
  columnDiv.style.cssText = `background-color: white; height: 250px; margin: 10px; margin-right: 0px; position: sticky; top: 0; z-index: 1000; background-color: inherit;`;
  const columnName = currColumn[i];
  const columnTitle = document.createElement('p');
  columnTitle.textContent = columnName;
  columnTitle.style.cssText = 'text-align: center; margin-bottom: 10px'; // Center the column name
  columnDiv.appendChild(columnTitle);

  const filterField = document.createElement('input');  
  filterField.type = 'text';
  filterField.placeholder = 'Keyphrase Filter...';
  filterField.style.cssText = 'width: 100%; padding: 10px;'; // Style the input field
  filterField.value = substringFilters[i];
  filterField.addEventListener('input', function() {
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
    llmFilters[i] = this.value;
  });
  columnDiv.appendChild(llmField);  

  const filterButton = document.createElement('button');
  filterButton.textContent = 'Sort & Filter';
  
  filterButton.style.cssText = 'margin: 10px; margin-right: 0px; background-color: #000000; color: white; padding: 10px;'; // Style the button
  columnDiv.appendChild(filterButton);
  filterButton.addEventListener('click', function() {
    sortTable(table, i, sortDxn[i]);
    llmRanking(table, i);
  });

  const sortReverseButton = document.createElement('button');
  sortReverseButton.textContent = 'Reverse';
  sortReverseButton.style.cssText = 'margin: 10px; border: 1px solid black; color: black; padding: 10px;'; // Style the button
  columnDiv.appendChild(sortReverseButton);
  sortReverseButton.addEventListener('click', function() {
    // Assuming sortTable can sort, you might need a separate function to reverse
    sortDxn[i] = !sortDxn[i];
    sortTable(table, i, sortDxn[i]);
  });

  return columnDiv;
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


async function llmRanking(el, index=-1) {
  if (!(el && el.tagName === 'TABLE')) return;
  let tbody = el.querySelector('tbody');
  if (!tbody) return;

  if (index != -1 && llmFilters[index].trim().length > 4) {
    let rows = currEntries.map(row => row.cloneNode(true));    
    const items = rows.map(row => row.querySelectorAll('td')[index]?.textContent.trim());
    const scores = [];
    for (var i = 0; i < items.length; i += CHUNK_SIZE) {
      const llmOutput = await callOpenAI(items.slice(i, i + CHUNK_SIZE), llmFilters[index]);
      scores = scores.concat(llmOutput);
      console.log(llmOutput.length, "    ", scores.length, " / ", items.length);
    }

    for (var i = 0; i < rows.length; i++) {
      rows[i] = {
        score: scores[i],
        row: rows[i]
      };
    }
    rows = rows
      .sort((a, b) => b.score - a.score);

      console.log(rows);
    rows = rows
      .map((data) => data.row);

    // Clear the tbody before appending sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row)); // Append all items that match the criteria
  }
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  return dotProduct / (normA * normB);
}

async function callOpenAI(items, target) {
  const model = 'text-embedding-3-small';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openaiKey}`
  };
  let response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      input: target,
      model: model, // Specify the model you want to use
    })
  });
  if (!response.ok) {
    throw new Error(`Error in OpenAI API call: ${response.statusText}`);
  }
  let data = await response.json();
  const targetEmbedding = data["data"][0]["embedding"];
  const itemTokens = Array.from(items).map(item => item);
  response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      input: itemTokens,
      model: model, // Specify the model you want to use
    })
  });
  data = await response.json();
  const itemEmbeddings = data["data"].map((d) => d["embedding"]);
  const similarities = itemEmbeddings.map((embedding) => cosineSimilarity(embedding, targetEmbedding));
  return similarities;
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


// Function to stop observing changes (e.g., when a new table is selected)
function disconnectObserver() {
  observer.disconnect();
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

function deselectStyle(el) {
  if (!el) return; // Guard clause to ensure el is not null
  el.style.setProperty('border-style', el.originalBorderStyle || '', 'important');
  el.style.setProperty('border-width', el.originalBorderWidth || '', 'important');
  el.style.setProperty('border-color', el.originalBorderColor || '', 'important');
}


document.addEventListener('mousedown', handleSelection);
