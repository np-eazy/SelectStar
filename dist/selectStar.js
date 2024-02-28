"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var currentSelectedTable = null; // Holds the current selected table
var currEntries = null; // 2d array view
var prevEntries = null; // spare pointer
var currColumn = null;
var sortDxn = null;
var substringFilters = null;
var llmFilters = null;
var allFilters = new Map(); // Persistent user input
var allLLMFilters = new Map();
var DIV_NAME = "selectStar";
var openaiKey = "sk-XkpG62CN8vaLV9EyXlhUT";
openaiKey += "3BlbkFJyxs43ffIH67BLH8mdBZF";
var CHUNK_SIZE = 128;
var CAP = 512;
function handleSelection(event) {
    var table = event.target.closest('table');
    if (table !== currentSelectedTable) {
        if (!table) {
            allFilters.set(currColumn.toString(), substringFilters);
            currColumn = null;
            currEntries = null;
            sortDxn = null;
            if (currentSelectedTable)
                restoreTable(currentSelectedTable, prevEntries);
            deselectStyle(currentSelectedTable);
            var overlayDiv = document.getElementById(DIV_NAME);
            if (overlayDiv) {
                overlayDiv.parentNode.removeChild(overlayDiv);
            }
            disconnectObserver();
        }
        currentSelectedTable = table;
        if (table) {
            observeTableChanges();
            currColumn = Array.from(table.querySelectorAll('thead th')).map(function (th) { return th.textContent.trim(); });
            currEntries = Array.from(table.querySelectorAll('tbody tr'));
            sortDxn = currColumn.map(function (x) { return false; });
            if (!allFilters.get(currColumn.toString())) {
                allFilters.set(currColumn.toString(), currColumn.map(function (x) { return ""; }));
                allLLMFilters.set(currColumn.toString(), currColumn.map(function (x) { return ""; }));
            }
            substringFilters = allFilters.get(currColumn.toString());
            llmFilters = allLLMFilters.get(currColumn.toString());
            prevEntries = currEntries;
            selectStyle(table);
            sortTable(table);
            var overlayDiv = document.createElement('div');
            overlayDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 0 4px;';
            overlayDiv.id = DIV_NAME;
            var colCount = currColumn.length;
            for (var i = 0; i < colCount; i++) {
                overlayDiv.appendChild(filterPanel(table, overlayDiv, i));
            }
            if (overlayDiv.firstChild)
                overlayDiv.firstChild.style.marginLeft = '0';
            if (overlayDiv.lastChild)
                overlayDiv.lastChild.style.marginRight = '0';
            var overlayTr = document.createElement('tr');
            var overlayTd = document.createElement('td');
            overlayTd.setAttribute('colspan', colCount.toString());
            overlayTd.appendChild(overlayDiv);
            overlayTr.appendChild(overlayTd);
            var thead = table.querySelector('thead');
            if (thead) {
                thead.parentNode.insertBefore(overlayTr, thead.nextSibling);
            }
            else {
                table.insertBefore(overlayTr, table.firstChild);
            }
        }
    }
}
function filterPanel(table, overlayDiv, i) {
    // Make sure you pass in a const for i!
    var columnDiv = document.createElement('div');
    columnDiv.style.cssText = "background-color: white; height: 250px; margin: 10px; margin-right: 0px; position: sticky; top: 0; z-index: 1000; background-color: inherit;";
    var columnName = currColumn[i];
    var columnTitle = document.createElement('p');
    columnTitle.textContent = columnName;
    columnTitle.style.cssText = 'text-align: center; margin-bottom: 10px'; // Center the column name
    columnDiv.appendChild(columnTitle);
    var filterField = document.createElement('input');
    filterField.type = 'text';
    filterField.placeholder = 'Keyphrase Filter...';
    filterField.style.cssText = 'width: 100%; padding: 10px;'; // Style the input field
    filterField.value = substringFilters[i];
    filterField.addEventListener('input', function () {
        substringFilters[i] = this.value;
        sortTable(table, i);
    });
    columnDiv.appendChild(filterField);
    var llmField = document.createElement('input');
    llmField.type = 'textarea';
    llmField.placeholder = 'AI Filter...';
    llmField.style.cssText = 'width: 100%; height: 50%;'; // Style the input field
    llmField.value = llmFilters[i];
    llmField.addEventListener('input', function () {
        llmFilters[i] = this.value;
    });
    columnDiv.appendChild(llmField);
    var filterButton = document.createElement('button');
    filterButton.textContent = 'Sort & Filter';
    filterButton.style.cssText = 'margin: 10px; margin-right: 0px; background-color: #000000; color: white; padding: 10px;'; // Style the button
    columnDiv.appendChild(filterButton);
    filterButton.addEventListener('click', function () {
        sortTable(table, i, sortDxn[i]);
        llmRanking(table, i);
    });
    var sortReverseButton = document.createElement('button');
    sortReverseButton.textContent = 'Reverse';
    sortReverseButton.style.cssText = 'margin: 10px; border: 1px solid black; color: black; padding: 10px;'; // Style the button
    columnDiv.appendChild(sortReverseButton);
    sortReverseButton.addEventListener('click', function () {
        // Assuming sortTable can sort, you might need a separate function to reverse
        sortDxn[i] = !sortDxn[i];
        sortTable(table, i, sortDxn[i]);
    });
    return columnDiv;
}
function sortTable(el, index, reverse) {
    if (index === void 0) { index = -1; }
    if (reverse === void 0) { reverse = false; }
    if (!(el && el.tagName === 'TABLE'))
        return;
    var tbody = el.querySelector('tbody');
    if (!tbody)
        return;
    // TODO: use caching to make this faster if we know the new operation strictly removes currently displayed items
    var rows = currEntries.map(function (tr) { return tr.cloneNode(true); });
    for (var k = 0; k < substringFilters.length; k++) {
        if (substringFilters[k] !== "") {
            var substrings = substringFilters[k].split(' ');
            var _loop_1 = function (substring) {
                if (substring[0] == '-') {
                    rows = rows.filter(function (row) {
                        var _a;
                        return !((_a = row.querySelectorAll('td')[k]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase().includes(substring.slice(1, substring.length).toLowerCase()));
                    });
                }
                else {
                    rows = rows.filter(function (row) {
                        var _a;
                        return (_a = row.querySelectorAll('td')[k]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase().includes(substring.toLowerCase());
                    });
                }
            };
            for (var _i = 0, substrings_1 = substrings; _i < substrings_1.length; _i++) {
                var substring = substrings_1[_i];
                _loop_1(substring);
            }
        }
    }
    if (index != -1) {
        rows.sort(function (a, b) {
            var _a, _b;
            var aValue = (_a = a.querySelectorAll('td')[index]) === null || _a === void 0 ? void 0 : _a.textContent.trim().toLowerCase();
            var bValue = (_b = b.querySelectorAll('td')[index]) === null || _b === void 0 ? void 0 : _b.textContent.trim().toLowerCase();
            return aValue.localeCompare(bValue);
        });
    }
    // Clear the tbody before appending sorted rows
    tbody.innerHTML = '';
    if (reverse) {
        rows = rows.reverse();
    }
    rows.forEach(function (row) { return tbody.appendChild(row); }); // Append all items that match the criteria
}
function llmRanking(el, index) {
    if (index === void 0) { index = -1; }
    return __awaiter(this, void 0, void 0, function () {
        var tbody, rows, items, scores, i, llmOutput, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(el && el.tagName === 'TABLE'))
                        return [2 /*return*/];
                    tbody = el.querySelector('tbody');
                    if (!tbody)
                        return [2 /*return*/];
                    if (!(index != -1 && llmFilters[index].trim().length > 4)) return [3 /*break*/, 5];
                    rows = currEntries.map(function (row) { return row.cloneNode(true); });
                    items = rows.map(function (row) { var _a; return (_a = row.querySelectorAll('td')[index]) === null || _a === void 0 ? void 0 : _a.textContent.trim(); });
                    scores = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < items.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callOpenAI(items.slice(i, i + CHUNK_SIZE), llmFilters[index])];
                case 2:
                    llmOutput = _a.sent();
                    scores = scores.concat(llmOutput);
                    console.log(llmOutput.length, "    ", scores.length, " / ", items.length);
                    _a.label = 3;
                case 3:
                    i += CHUNK_SIZE;
                    return [3 /*break*/, 1];
                case 4:
                    for (i = 0; i < rows.length; i++) {
                        rows[i] = {
                            score: scores[i],
                            row: rows[i]
                        };
                    }
                    rows = rows
                        .sort(function (a, b) { return b.score - a.score; });
                    console.log(rows);
                    rows = rows
                        .map(function (data) { return data.row; });
                    // Clear the tbody before appending sorted rows
                    tbody.innerHTML = '';
                    rows.forEach(function (row) { return tbody.appendChild(row); }); // Append all items that match the criteria
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function cosineSimilarity(vecA, vecB) {
    var dotProduct = 0.0;
    var normA = 0.0;
    var normB = 0.0;
    for (var i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += Math.pow(vecA[i], 2);
        normB += Math.pow(vecB[i], 2);
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    return dotProduct / (normA * normB);
}
function callOpenAI(items, target) {
    return __awaiter(this, void 0, void 0, function () {
        var model, headers, response, data, targetEmbedding, itemTokens, itemEmbeddings, similarities;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    model = 'text-embedding-3-small';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': "Bearer ".concat(openaiKey)
                    };
                    return [4 /*yield*/, fetch('https://api.openai.com/v1/embeddings', {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({
                                input: target,
                                model: model, // Specify the model you want to use
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Error in OpenAI API call: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    targetEmbedding = data["data"][0]["embedding"];
                    itemTokens = Array.from(items).map(function (item) { return item; });
                    return [4 /*yield*/, fetch('https://api.openai.com/v1/embeddings', {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({
                                input: itemTokens,
                                model: model, // Specify the model you want to use
                            })
                        })];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    itemEmbeddings = data["data"].map(function (d) { return d["embedding"]; });
                    similarities = itemEmbeddings.map(function (embedding) { return cosineSimilarity(embedding, targetEmbedding); });
                    return [2 /*return*/, similarities];
            }
        });
    });
}
// Function to update currEntries based on the current table
function updateCurrEntries() {
    if (currentSelectedTable) {
        currEntries = Array.from(currentSelectedTable.querySelectorAll('tbody tr'));
    }
}
// MutationObserver callback function
var tableMutationCallback = function (mutationsList, observer) {
    // For simplicity, update currEntries on any mutation. 
    // You might want to filter mutations for more specific changes.
    updateCurrEntries();
};
// Create a MutationObserver instance and pass the callback function
var observer = new MutationObserver(tableMutationCallback);
// Function to start observing the current selected table
function observeTableChanges() {
    if (currentSelectedTable) {
        // Configuration object for the observer
        var config = { childList: true, subtree: true };
        // Start observing the table body for configured mutations
        var tbody = currentSelectedTable.querySelector('tbody');
        if (tbody) {
            observer.observe(tbody, config);
        }
    }
}
function selectStyle(el) {
    if (!el)
        return; // Guard clause to ensure el is not null
    var style = window.getComputedStyle(el);
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
    if (!table || !prevEntries)
        return;
    var tbody = table.querySelector('tbody');
    if (!tbody)
        return;
    // Clear current tbody
    tbody.innerHTML = '';
    // Repopulate tbody with prevEntries, which are tr elements
    prevEntries.forEach(function (tr) {
        // Clone the tr element to avoid issues with reappending elements already in the DOM
        var clonedTr = tr.cloneNode(true);
        tbody.appendChild(clonedTr);
    });
}
function deselectStyle(el) {
    if (!el)
        return; // Guard clause to ensure el is not null
    el.style.setProperty('border-style', el.originalBorderStyle || '', 'important');
    el.style.setProperty('border-width', el.originalBorderWidth || '', 'important');
    el.style.setProperty('border-color', el.originalBorderColor || '', 'important');
}
document.addEventListener('mousedown', handleSelection);
