let allData = [];
let charts = {};

// Event listeners
document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('applyFilters').addEventListener('click', applyFilters, false);

// Handle file upload (CSV or XLSX)
function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
        reader.onload = function(e) {
            allData = CSVToArray(e.target.result);
            populateFilters(allData);
            updateDashboard(allData);
        };
        reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx")) {
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            allData = jsonData;
            populateFilters(allData);
            updateDashboard(allData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Unsupported file type! Please upload CSV or XLSX.");
    }
}

// CSV parser (same as before)
function CSVToArray(strData, strDelimiter = ",") {
    const pattern = new RegExp(
        `(\\${strDelimiter}|\\r?\\n|\\r|^)` +
        `(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\${strDelimiter}\\r\\n]*))`,
        "gi"
    );
    const data = [[]];
    let matches = null;

    while (matches = pattern.exec(strData)) {
        const matchedDelimiter = matches[1];
        if (matchedDelimiter.length && matchedDelimiter !== strDelimiter) {
            data.push([]);
        }
        const matchedValue = matches[2] ? matches[2].replace(/""/g, '"') : matches[3];
        data[data.length - 1].push(matchedValue);
    }
    return data;
}

// Populate filters
function populateFilters(data) {
    const headers = data[0];
    const rows = data.slice(1);
    const regions = new Set(), districts = new Set();

    rows.forEach(row => {
        regions.add(row[headers.indexOf("Region")]);
        districts.add(row[headers.indexOf("District")]);
    });

    const regionSelect = document.getElementById("regionFilter");
    const districtSelect = document.getElementById("districtFilter");
    regionSelect.innerHTML = '<option value="">All</option>';
    districtSelect.innerHTML = '<option value="">All</option>';

    regions.forEach(r => regionSelect.appendChild(new Option(r, r)));
    districts.forEach(d => districtSelect.appendChild(new Option(d, d)));
}

// Apply filters
function applyFilters() {
    const region = document.getElementById("regionFilter").value;
    const district = document.getElementById("districtFilter").value;
    const date = document.getElementById("dateFilter").value;

    const headers = allData[0];
    const filtered = allData.slice(1).filter(row => {
        return (!region || row[headers.indexOf("Region")] === region) &&
               (!district || row[headers.indexOf("District")] === district) &&
               (!date || row[headers.indexOf("Date Completed")] === date);
    });

    updateDashboard([headers, ...filtered]);
}

// Render Table
function renderTable(data) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = "";
    const table = document.createElement('table');

    data.forEach((row, i) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = i === 0 ? document.createElement('th') : document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    container.appendChild(table);
}

// Render Charts
function renderCharts(data) {
    const headers = data[0];
    const rows = data.slice(1);

    const metrics = [
        { col: "HH Interviews Complete?", canvas: "chartHHComplete", label: "HH Interviews Completed" },
        { col: "Count HIV Final Result", canvas: "chartHIVResult", label: "HIV Results" },
        { col: "Testing Complete?", canvas: "chartTestingComplete", label: "Testing Completed" }
    ];

    metrics.forEach(metric => {
        const colIndex = headers.indexOf(metric.col);
        const regionIndex = headers.indexOf("Region");

        const counts = {};
        rows.forEach(r => {
            const region = r[regionIndex];
            let value = r[colIndex];
            if (["yes","Yes","1"].includes(value)) value = 1;
            else if (!isNaN(value)) value = parseInt(value);
            else value = 0;

            if (!counts[region]) counts[region] = 0;
            counts[region] += value;
        });

        const ctx = document.getElementById(metric.canvas).getContext('2d');
        if (charts[metric.canvas]) charts[metric.canvas].destroy();

        charts[metric.canvas] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(counts),
                datasets: [{ label: metric.label, data: Object.values(counts), backgroundColor: 'rgba(54, 162, 235, 0.6)' }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    });
}

// Update dashboard
function updateDashboard(data) {
    renderTable(data);
    renderCharts(data);
}
