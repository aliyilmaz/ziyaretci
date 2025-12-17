// LocalStorage key
const VISITORS = "visitors";
const VISITORFILTERS = "visitorFilters";
const VISITORSORT = "visitorSort";
const VISITORSETTINGS = "visitorSettings";
const SEARCHQUERY = "searchQuery";
const CURRENTPAGE = "currentPage";
const VISITORGROUP = "visitorGroup";
const GROUPINGENABLED = "groupingEnabled";

// DOM Elements
const visitorTableBody = document.querySelector("#visitorTable tbody");
const addVisitorButton = document.getElementById("addVisitorButton");
const visitorModal = document.getElementById("visitorModal");
const closeButton = document.querySelector(".close-button");
const visitorForm = document.getElementById("visitorForm");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const importFile = document.getElementById("importFile");
const searchInput = document.getElementById("searchInput");

let editingIndex = null; // To track if editing

// Open modal for adding
addVisitorButton.addEventListener("click", () => {
    visitorModal.style.display = "block";
    visitorForm.reset();
    editingIndex = null; 
    visitorModal.querySelector('h2').innerHTML ='Yeni Ziyaretçi Ekle';
    document.querySelector('body').style.overflow = 'hidden';
});

// Close modal
closeButton.addEventListener("click", () => {
    visitorModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === visitorModal) {
        visitorModal.style.display = "none";
        document.querySelector('body').style.overflow = 'hidden';
    }
});

// Load visitors from localStorage
function loadVisitors() {
    searchVisitor();
}

// Save visitors to localStorage
function saveVisitors(visitors) {
    let result = [];
    for (let index = 0; index < visitors.length; index++) {
        let visitor = visitors[index];
        visitor.id = index;
        result.push(visitor);
    }
    
    localStorage.setItem(VISITORS, JSON.stringify(result));

    searchVisitor();
}

// Information from Localstorage for settings
function getStoredItemsPerPage() {
    const settings = JSON.parse(localStorage.getItem(VISITORSETTINGS)) || {};
    return settings.itemsPerPage || 5;
}

// Information to Localstorage for Settings
function setStoredItemsPerPage(itemsPerPage) {
    const settings = JSON.parse(localStorage.getItem(VISITORSETTINGS)) || {};
    settings.itemsPerPage = itemsPerPage;
    localStorage.setItem(VISITORSETTINGS, JSON.stringify(settings));
}

// Format date to YYYY-MM-DDTHH:MM
function formatDateForInput(dateString) {
    if(!dateString){
        return '';
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function visitorRows(visitors) {
    const filters = JSON.parse(localStorage.getItem(VISITORFILTERS)) || {};
    const showAllColumns = Object.values(filters).every(filter => !filter);

    const headers = ["<th><input type='checkbox' id='selectAll' /></th>", "<th role='columnheader'>Id</th>"];
    if (showAllColumns || filters.entryDate) headers.push("<th role='columnheader'>Giriş</th>");
    if (showAllColumns || filters.exitDate) headers.push("<th role='columnheader'>Çıkış</th>");
    if (showAllColumns || filters.visitorType) headers.push("<th role='columnheader'>Tür</th>");
    if (showAllColumns || filters.apartment) headers.push("<th role='columnheader'>Daire</th>");
    if (showAllColumns || filters.host) headers.push("<th role='columnheader'>Kime</th>");
    if (showAllColumns || filters.visitorName) headers.push("<th role='columnheader'>Adı</th>");
    if (showAllColumns || filters.visitorPlate) headers.push("<th role='columnheader'>Plaka</th>");
    if (showAllColumns || filters.description) headers.push("<th role='columnheader'>Açıklama</th>");
    headers.push("<th role='columnheader'>Bildirim</th>");
    headers.push("<th role='columnheader'>İşlemler</th>");

    const thead = visitorTableBody.closest("table").querySelector("thead tr");
    thead.innerHTML = headers.join("");

    if(filters.entryDate == undefined){
        filters.entryDate = true;
        filters.exitDate = true;
        filters.visitorType = true;
        filters.apartment = true;
        filters.host = true;
        filters.visitorName = true;
        filters.visitorPlate = true;
        filters.description = true;
    }    
    
    visitors.forEach((visitor, index) => {
        const row = document.createElement("tr");

        let cells = `
            <td><input id="visitorSelect-${visitor.id}" type="checkbox" data-index="${visitor.id}"></td>
            <td data-label="Id" style="font-weight:bold;">${visitor.id}</td>
        `;
        if (showAllColumns || filters.entryDate) {
            cells += `
                <td data-label="Giriş">
                    <input type="datetime-local" data-column="entryDate" value="${formatDateForInput(visitor.entryDate)}">
                </td>
            `;
        }
        if (showAllColumns || filters.exitDate) {
            cells += `
                <td data-label="Çıkış">
                    <input type="datetime-local" data-column="exitDate" value="${formatDateForInput(visitor.exitDate)}">
                </td>
            `;
        }
        if (showAllColumns || filters.visitorType) {
            cells += `
                <td data-label="Tür">
                    <select id="visitorType-${visitor.id}" data-column="visitorType">
                        <option value="Yaya" ${visitor.visitorType === "Yaya" ? "selected" : ""}>Yaya</option>
                        <option value="Araç" ${visitor.visitorType === "Araç" ? "selected" : ""}>Araç</option>
                        <option value="Paket Yemek" ${visitor.visitorType === "Paket Yemek" ? "selected" : ""}>Paket Yemek</option>
                        <option value="Kargo" ${visitor.visitorType === "Kargo" ? "selected" : ""}>Kargo</option>
                    </select>
                </td>
            `;
        }
        if (showAllColumns || filters.apartment) {
            cells += `
                <td data-label="Daire" contenteditable="true" data-column="apartment">${visitor.apartment}</td>
            `;
        }
        if (showAllColumns || filters.host) {
            cells += `
                <td data-label="Kime" contenteditable="true" data-column="host">${visitor.host}</td>
            `;
        }
        if (showAllColumns || filters.visitorName) {
            cells += `
                <td data-label="Adı" contenteditable="true" data-column="visitorName">${visitor.visitorName}</td>
            `;
        }
        if (showAllColumns || filters.visitorPlate) {
            cells += `
                <td data-label="Plaka" contenteditable="true" data-column="visitorPlate">${visitor.visitorPlate}</td>
            `;
        }
        if (showAllColumns || filters.description) {
            cells += `
                <td data-label="Açıklama" contenteditable="true" data-column="description">${visitor.description}</td>
            `;
        }
        cells += `
            <td data-label="Bildirim">
                <select id="notified-${visitor.id}" data-column="notified">
                    <option value="Evet" ${visitor.notified === 'Evet' ? "selected" : ""}>Evet</option>
                    <option value="Hayır" ${visitor.notified === 'Hayır' ? "selected" : ""}>Hayır</option>
                </select>
            </td>
            <td data-label="İşlemler">
                <div class="process">
                    <button class="edit-button" data-index="${visitor.id}" title="Düzenle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </button>
                    <button class="delete-button" data-index="${visitor.id}" title="Sil">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        row.innerHTML = cells;
        visitorTableBody.appendChild(row);
    });
}

function renderVisitors(visitors) {
    visitorTableBody.innerHTML = "";
    visitorRows(visitors);
    visitorAddEvents();
}

let isGroupEnabled = false;

const groupToggleButton = document.getElementById("groupToggleButton");
const groupModal = document.getElementById("groupModal");
const groupForm = document.getElementById("groupForm");
const groupCloseButton = groupModal.querySelector(".close-button");
groupToggleButton.addEventListener("click", ()=>{
    if(!isGroupEnabled){
        isGroupEnabled = true;
    } else {
        isGroupEnabled = false;
    }
    localStorage.setItem(GROUPINGENABLED, isGroupEnabled); 
    searchVisitor();
});

groupButton.addEventListener("click", () => {    
    groupModal.style.display = "block";
    document.querySelector('body').style.overflow = 'hidden';
    const storedGroup = JSON.parse(localStorage.getItem(VISITORGROUP)) || {};

    const groupColumnSelect = document.getElementById("groupColumn");
    groupColumnSelect.value = storedGroup.groupColumn || "apartment";
});

// Close group modal
groupCloseButton.addEventListener("click", () => {
    groupModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === groupModal) {
        groupModal.style.display = "none";
        document.querySelector('body').style.overflow = 'auto';
    }
});

// Save selected group options to localStorage
groupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // isGroupEnabled = true;
    const groupColumn = document.getElementById("groupColumn").value;
    const groupSettings = { groupColumn };
    localStorage.setItem(VISITORGROUP, JSON.stringify(groupSettings));
    groupModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
    
    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    if (visitors.length === 0) {
        alert("Gruplama için veri bulunamadı!");
        return;
    }
    // searchVisitor();
});



function groupVisitorsByColumn(visitors, groupColumn) {
    let result = {};
    for (let index = 0; index < visitors.length; index++) {
        const visitor = visitors[index];
        const groupKey = visitor[groupColumn];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(visitor);
    }
    return result;
}



function renderGroupedVisitors(groupedVisitors) {
    visitorTableBody.innerHTML = ""; // Eski verileri temizle
    
    const storedGroup = JSON.parse(localStorage.getItem(VISITORGROUP)) || {};
    const groupColumn = storedGroup.groupColumn || "apartment";
    let groupName = null;
    
    if(groupColumn == 'visitorPlate') { groupName = 'Plaka:';}
    if(groupColumn == 'host') { groupName = 'Ev Sahibi Adı:';}
    if(groupColumn == 'visitorName') { groupName = 'Ziyaretçi Adı:';}
    if(groupColumn == 'apartment') { groupName = 'Daire:';}
    if(groupColumn == 'visitorType') { groupName = 'Ziyaret Türü:';}
    if(groupColumn == 'notified') { groupName = 'Bildirim:';}
    if(groupColumn == 'description') { groupName = 'Açıklama:';}
   

    for (let groupKey in groupedVisitors) {     
       
        const group = groupedVisitors[groupKey];
        const groupRow = document.createElement("tr");
        const groupCell = document.createElement("td");
        groupCell.colSpan = 12;
        groupCell.innerHTML = `${groupName} ${groupKey} <small class="group_visitor_count">(${group.length} ziyaretçi)</small>`;
        groupCell.style.fontWeight = "bold";
        groupCell.style.backgroundColor = "#f1f1f1";
        groupCell.style.fontSize = "18px";
        groupRow.appendChild(groupCell);
        visitorTableBody.appendChild(groupRow);

        visitorRows(group);
    }
    visitorAddEvents();
}



function visitorAddEvents() {
    // Add event listeners for inline editing
    const editableCells = document.querySelectorAll("td[contenteditable='true']");
    editableCells.forEach(cell => {
        cell.addEventListener("blur", handleInlineEdit);
    });

    // Add event listeners for datetime-local changes
    const dateInputs = document.querySelectorAll("#visitorTable input[type='datetime-local']");
    dateInputs.forEach(input => {
        input.addEventListener("change", handleDateChange);
    });

    // Add event listeners for dropdown changes
    const selectElements = document.querySelectorAll("select");
    selectElements.forEach(select => {
        select.addEventListener("change", handleDropdownChange);
    });

    // Add event listeners for edit buttons
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach(button => {
        button.addEventListener("click", () => {
            handleEditButtonClick(button);
        });
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach(button => {
        button.addEventListener("click", () => {
            handleDeleteButtonClick(button);
        });
    });

    // DOM Elements
    const deleteSelectedButton = document.getElementById("deleteSelectedButton");

    // "Seçilenleri Sil" butonuna tıklama işlemi
    deleteSelectedButton.addEventListener("click", () => {
        const checkboxes = document.querySelectorAll("table input[type='checkbox']:checked");
        const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];

        // Silinecek ziyaretçileri bulma
        const indexesToDelete = [];
        checkboxes.forEach(checkbox => {
            const index = checkbox.dataset.index;
            indexesToDelete.push(index);        
        });

        // Seçilen ziyaretçileri silme
        const remainingVisitors = visitors.filter((visitor, index) => !indexesToDelete.includes(String(index)));

        selectAllCheckbox.checked = false;
        // Yeni listeyi kaydetme ve render etme
        saveVisitors(remainingVisitors);        
        searchVisitor();
    });


    const selectAllCheckbox = document.getElementById("selectAll");
    selectAllCheckbox.addEventListener("change", (event) => {
        const isChecked = event.target.checked;
        const checkboxes = document.querySelectorAll("table input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
}

function handleEditButtonClick(button) {
    const index = button.getAttribute("data-index");
    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    const visitor = visitors[index];

    // Format the date for input field
    const entryDate = formatDateForInput(visitor.entryDate);
    const exitDate = formatDateForInput(visitor.exitDate);

    // Populate the form with visitor details
    document.getElementById("entryDate").value = entryDate;
    document.getElementById("exitDate").value = exitDate;
    document.getElementById("visitorType").value = visitor.visitorType;
    document.getElementById("apartment").value = visitor.apartment;
    document.getElementById("host").value = visitor.host;
    document.getElementById("visitorName").value = visitor.visitorName;
    document.getElementById("visitorPlate").value = visitor.visitorPlate;
    document.getElementById("description").value = visitor.description;

    // Open modal and set editing index
    visitorModal.style.display = "block";
    editingIndex = index;
    visitorModal.querySelector('h2').innerHTML ='Ziyaretçiyi Düzenle';
    document.querySelector('body').style.overflow = 'hidden';
}

function handleDeleteButtonClick(button) {
    const index = button.getAttribute("data-index");
    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];

    // Remove visitor at the given index
    const updatedVisitors = visitors.filter((visitor, visitorIndex) => visitorIndex != index);

    saveVisitors(updatedVisitors);

    // Re-render the visitors
    searchVisitor();
}

// DOM Elements
const deleteAllButton = document.getElementById("deleteAllButton");

// "Tümünü Sil" butonuna tıklama işlemi
deleteAllButton.addEventListener("click", () => {
    const confirmDelete = confirm("Tüm kayıtları silmek istediğinizden emin misiniz?");
    if (confirmDelete) {
        localStorage.removeItem(VISITORS);
        searchVisitor(); // Ziyaretçileri yeniden yükle
        alert("Tüm kayıtlar silindi!");
    }
});


// Handle changes in the datetime-local input
function handleDateChange(event) {
    const column = event.target.getAttribute("data-column");
    const newValue = event.target.value;
    const index = event.target.closest("tr").querySelector("input[type='checkbox']").dataset.index;

    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    visitors[index][column] = newValue; // Update the specific visitor's field
    visitors[index].updated_at = new Date().toISOString(); // Update the updated_at field
    saveVisitors(visitors);
}

// Handle dropdown changes (for both visitorType and notified)
function handleDropdownChange(event) {
    const column = event.target.getAttribute("data-column");
    if(column != undefined){
        const newValue = event.target.value === "true" ? true : event.target.value === "false" ? false : event.target.value;
        const index = event.target.closest("tr").querySelector("input[type='checkbox']").dataset.index;
        const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
        visitors[index][column] = newValue; // Update the specific visitor's field
        visitors[index].updated_at = new Date().toISOString(); // Update the updated_at field
        saveVisitors(visitors);
    }
}


// Handle inline editing
function handleInlineEdit(event) {
    const column = event.target.getAttribute("data-column");
    const newValue = event.target.innerText;
    const index = event.target.closest("tr").querySelector("input[type='checkbox']").dataset.index;

    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    visitors[index][column] = newValue; // Update the specific visitor's field
    visitors[index].updated_at = new Date().toISOString(); // Update the updated_at field
    saveVisitors(visitors);
}

// Add or update visitor
visitorForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    const now = new Date().toISOString();
    const newVisitor = {
        entryDate: document.getElementById("entryDate").value,
        exitDate: document.getElementById("exitDate").value,
        visitorType: document.getElementById("visitorType").value,
        apartment: document.getElementById("apartment").value,
        host: document.getElementById("host").value,
        visitorName: document.getElementById("visitorName").value,
        visitorPlate: document.getElementById("visitorPlate").value,
        description: document.getElementById("description").value,
        notified: false,
        created_at: now,
        updated_at: now
    };

    if (editingIndex !== null) {
        // Update existing visitor
        newVisitor.created_at = visitors[editingIndex].created_at; // Preserve the original created_at
        visitors[editingIndex] = newVisitor;
        editingIndex = null;
    } else {
        // Add new visitor
        visitors.push(newVisitor);
    }

    saveVisitors(visitors);
    visitorModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
    visitorForm.reset();
    searchVisitor();
});


// Export visitors as CSV
exportButton.addEventListener("click", () => {
    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    const checkboxes = document.querySelectorAll("table input[type='checkbox']:checked");
    
    let visitorsToExport = visitors;

    if (checkboxes.length > 0) {
        const selectedIndexes = Array.from(checkboxes).map(checkbox => checkbox.dataset.index);
        visitorsToExport = visitors.filter((visitor, index) => selectedIndexes.includes(String(index)));
    }

    if (visitorsToExport.length === 0) {
        alert("İhracat için veri bulunamadı!");
        return;
    }

    const csvRows = [];
    const headers = ["Id", "Giriş Tarihi", "Çıkış Tarihi", "Ziyaretçi Tipi", "Daire", "Ev Sahibi", "Ziyaretçi Adı", "Plaka", "Açıklama", "Bilgilendirildi mi?", "Oluşturma Tarihi", "Güncelleme Tarihi"];
    csvRows.push(headers.join(","));

    visitorsToExport.forEach(visitor => {
        const row = [
            visitor.id,
            visitor.entryDate,
            visitor.exitDate,
            visitor.visitorType,
            visitor.apartment,
            visitor.host,
            visitor.visitorName,
            visitor.visitorPlate,
            visitor.description,
            visitor.notified ? "Evet" : "Hayır",
            visitor.created_at,
            visitor.updated_at
        ];
        csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`; // Zaman damgasını oluştur ve uygun formatta düzenle
    saveAs(blob, `ziyaretci_listesi_${timestamp}.csv`); // FileSaver.js ile dosya indirme işlemi
});


importButton.onclick = function () {        
    importFile.click();
};

importFile.addEventListener("change", handleFileImport);

// Import visitors from CSV
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("Bir dosya seçmediniz!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const visitors = parseCSV(contents);
        if (visitors && visitors.length > 0) {
            const existingVisitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
            const updatedVisitors = existingVisitors.concat(visitors);
            saveVisitors(updatedVisitors);
            searchVisitor();
            alert("Veriler başarıyla içe aktarıldı!");
        } else {
            alert("Geçerli CSV formatı bulunamadı.");
        }
    };
    reader.readAsText(file);
    importFile.value = null;    
}

function parseCSV(csv) {
    const rows = csv.split("\n").map(row => row.trim()).filter(row => row.length > 0); // Clean rows and remove empty ones
    const headers = rows[0].split(",").map(header => header.trim()); // Clean headers
    const data = [];

    // Check if headers match the expected columns
    const expectedHeaders = ["Id", "Giriş Tarihi", "Çıkış Tarihi", "Ziyaretçi Tipi", "Daire", "Ev Sahibi", "Ziyaretçi Adı", "Plaka", "Açıklama", "Bilgilendirildi mi?", "Oluşturma Tarihi", "Güncelleme Tarihi"];
    if (!headers.every((header, index) => header === expectedHeaders[index])) {
        alert("CSV başlıkları uyumsuz. Lütfen doğru formatta bir CSV dosyası kullanın.");
        return [];
    }

    // Start from the second row and create objects
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(",").map(cell => cell.trim()); // Clean cells
        if (row.length === headers.length) {
            const visitor = {
                id: row[0],
                entryDate: row[1],
                exitDate: row[2],
                visitorType: row[3],
                apartment: row[4],
                host: row[5],
                visitorName: row[6],
                visitorPlate: row[7],
                description: row[8],
                notified: row[9],
                created_at: row[10],
                updated_at: row[11]
            };
            data.push(visitor);
        }
    }

    return data;
}


// Sayfalama ile ilgili değişkenler
let currentPage = 1;
let itemsPerPage = parseInt(document.getElementById("itemsPerPageSelect").value, 10);

const itemsPerPageSelect = document.getElementById("itemsPerPageSelect");
itemsPerPage = getStoredItemsPerPage();
itemsPerPageSelect.value = itemsPerPage;

itemsPerPageSelect.addEventListener("change", (event) => {
    itemsPerPage = parseInt(event.target.value, 10);
    setStoredItemsPerPage(itemsPerPage);
    currentPage = 1; // Sayfa numarasını sıfırla
    searchVisitor(); // Ziyaretçileri yeniden yükle
});

function paginateVisitors(visitors) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return visitors.slice(start, end);
}

document.addEventListener("DOMContentLoaded", () => {
    const storedGroupingEnabled = localStorage.getItem(GROUPINGENABLED);
    if (storedGroupingEnabled) {
        isGroupEnabled = storedGroupingEnabled === "true";
    }
    const storedPage = localStorage.getItem(CURRENTPAGE);
    if (storedPage) {
        currentPage = parseInt(storedPage, 10);
    }
    searchVisitor();
});


// Sayfayı değiştirdiğinizde geçerli sayfayı localStorage'a kaydet
function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = totalPages;
    } else if (currentPage <= halfVisiblePages) {
        startPage = 1;
        endPage = maxVisiblePages;
    } else if (currentPage + halfVisiblePages >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
    } else {
        startPage = currentPage - halfVisiblePages;
        endPage = currentPage + halfVisiblePages;
    }

    if (startPage > 1) {
        const firstPageButton = document.createElement("button");
        firstPageButton.innerText = 1;
        firstPageButton.addEventListener("click", () => {
            currentPage = 1;
            localStorage.setItem(CURRENTPAGE, currentPage); // Sayfayı kaydet
            searchVisitor();
        });
        paginationContainer.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.innerText = "...";
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.classList.toggle("active", i === currentPage); // Aktif sayfa için class ekle
        pageButton.addEventListener("click", () => {
            currentPage = i;
            localStorage.setItem(CURRENTPAGE, currentPage); // Sayfayı kaydet
            searchVisitor();
        });
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.innerText = "...";
            paginationContainer.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement("button");
        lastPageButton.innerText = totalPages;
        lastPageButton.addEventListener("click", () => {
            currentPage = totalPages;
            localStorage.setItem(CURRENTPAGE, currentPage); // Sayfayı kaydet
            searchVisitor();
        });
        paginationContainer.appendChild(lastPageButton);
    }
}

// FILTER

// DOM Elements
const filterButton = document.getElementById("filterButton");
const filterModal = document.getElementById("filterModal");
const filterForm = document.getElementById("filterForm");
const filterCloseButton = filterModal.querySelector(".close-button");

// Open filter modal
filterButton.addEventListener("click", () => {
    filterModal.style.display = "block";
    document.querySelector('body').style.overflow = 'hidden';
    const storedFilters = JSON.parse(localStorage.getItem(VISITORFILTERS)) || {};

    // Varsayılan filtreleme ayarları
    const defaultFilters = {
        entryDate: true,
        exitDate: true,
        visitorType: true,
        apartment: true,
        host: true,
        visitorName: true,
        visitorPlate: true,
        description: true,
        scope: "hepsi"
    };

    const filterOptions = filterForm.elements["filterOptions"];
    for (let option of filterOptions) {
        option.checked = storedFilters[option.value] !== undefined ? storedFilters[option.value] : defaultFilters[option.value];
    }

    // Kapsam seçeneğini localStorage'den veya varsayılan değerlerden yükle
    const scopeSelect = document.getElementById("scope");
    scopeSelect.value = storedFilters.scope || defaultFilters.scope;
});


// Close filter modal
filterCloseButton.addEventListener("click", () => {
    filterModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === filterModal) {
        filterModal.style.display = "none";
        document.querySelector('body').style.overflow = 'auto';
    }
});


// Save selected filters to localStorage
filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const filters = {};
    const filterOptions = filterForm.elements["filterOptions"];
    for (let option of filterOptions) {
        filters[option.value] = option.checked;
    }
    // Kapsam seçeneğini localStorage'ye kaydet
    const scopeSelect = document.getElementById("scope");
    filters.scope = scopeSelect.value;
    localStorage.setItem(VISITORFILTERS, JSON.stringify(filters));
    filterModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
    searchVisitor();
});

// FILTER


// SORT
// Sıralama Modalını açma
const sortButton = document.getElementById("sortButton");
const sortModal = document.getElementById("sortModal");
const sortForm = document.getElementById("sortForm");
const sortCloseButton = sortModal.querySelector(".close-button");

sortButton.addEventListener("click", () => {
    sortModal.style.display = "block";
    document.querySelector('body').style.overflow = 'hidden';
    const storedSort = JSON.parse(localStorage.getItem(VISITORSORT)) || {};

    // Varsayılan sıralama ayarları
    const defaultSort = {
        sortColumn: "entryDate",
        sortOrder: "asc"
    };

    const sortColumnSelect = document.getElementById("sortColumn");
    const sortOrderSelect = document.getElementById("sortOrder");
    sortColumnSelect.value = storedSort.sortColumn || defaultSort.sortColumn;
    sortOrderSelect.value = storedSort.sortOrder || defaultSort.sortOrder;
});

// Close sort modal
sortCloseButton.addEventListener("click", () => {
    sortModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === sortModal) {
        sortModal.style.display = "none";
        document.querySelector('body').style.overflow = 'auto';
    }
});

// Save selected sort options to localStorage
sortForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const sortColumn = document.getElementById("sortColumn").value;
    const sortOrder = document.getElementById("sortOrder").value;
    const sortSettings = { sortColumn, sortOrder };
    localStorage.setItem(VISITORSORT, JSON.stringify(sortSettings));
    sortModal.style.display = "none";
    document.querySelector('body').style.overflow = 'auto';
    searchVisitor();
});

// Sıralama fonksiyonu
function sortVisitors(visitors, sortColumn, sortOrder) {
    return visitors.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === "entryDate") {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortColumn === "id") {
            aValue = parseInt(aValue, 10);
            bValue = parseInt(bValue, 10);
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}



// SORT

const storedQuery = localStorage.getItem(SEARCHQUERY);
if (storedQuery) {
    searchInput.value = storedQuery;
    searchVisitor(); // Ziyaretçileri arama sorgusuna göre filtrele
}
// Search visitors
searchInput.addEventListener("input", () => {
    localStorage.setItem(SEARCHQUERY, searchInput.value.toLowerCase());
    searchVisitor();
});


// Search visitors
function searchVisitor() {
    const query = searchInput.value.toLowerCase(); 
    const visitors = JSON.parse(localStorage.getItem(VISITORS)) || [];
    let filteredVisitors = visitors.filter(visitor => {
        return (
            visitor.entryDate.toLowerCase().includes(query) ||
            visitor.exitDate.toLowerCase().includes(query) ||
            visitor.visitorType.toLowerCase().includes(query) ||
            visitor.apartment.toLowerCase().includes(query) ||
            visitor.host.toLowerCase().includes(query) ||
            visitor.visitorName.toLowerCase().includes(query) ||
            visitor.visitorPlate.toLowerCase().includes(query) ||
            visitor.description.toLowerCase().includes(query)
        );
    });

    // Kapsam filtresi
    const storedFilters = JSON.parse(localStorage.getItem(VISITORFILTERS)) || {};
    const scopeSelect = storedFilters.scope || "hepsi";
    const now = new Date();
    if (scopeSelect !== "hepsi") {
        filteredVisitors = filteredVisitors.filter(visitor => {
            const visitorDate = new Date(visitor.entryDate);
            if (scopeSelect === "haftalik") {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return visitorDate >= oneWeekAgo;
            } else if (scopeSelect === "aylik") {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(now.getMonth() - 1);
                return visitorDate >= oneMonthAgo;
            } else if (scopeSelect === "yillik") {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                return visitorDate >= oneYearAgo;
            } else if (scopeSelect === "iki-yillik") {
                const twoYearsAgo = new Date();
                twoYearsAgo.setFullYear(now.getFullYear() - 2);
                return visitorDate >= twoYearsAgo;
            }
            return true;
        });
    }

    // Sıralama filtresi
    const storedSort = JSON.parse(localStorage.getItem(VISITORSORT)) || {};
    const sortColumn = storedSort.sortColumn || "entryDate";
    const sortOrder = storedSort.sortOrder || "asc";
    const sortedVisitors = sortVisitors(filteredVisitors, sortColumn, sortOrder);

    const paginatedVisitors = paginateVisitors(sortedVisitors);
    const storedGroup = JSON.parse(localStorage.getItem(VISITORGROUP)) || {};
    const groupColumn = storedGroup.groupColumn || "apartment";
    if (!isGroupEnabled) {
        renderVisitors(paginatedVisitors);
    } else {
        const groupedVisitors = groupVisitorsByColumn(paginatedVisitors, groupColumn);
        renderGroupedVisitors(groupedVisitors);
    }

    renderPaginationControls(filteredVisitors.length);

    const total_result = filteredVisitors.length;
    document.querySelector('#total_result span').innerHTML = total_result;
}



// Initial load of visitors
loadVisitors();
