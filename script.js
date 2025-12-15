let rawData = [];

const fileInput = document.getElementById("fileInput");
const regionFilter = document.getElementById("regionFilter");
const districtFilter = document.getElementById("districtFilter");
const dateFilter = document.getElementById("dateFilter");
const applyFilters = document.getElementById("applyFilters");

const chartHHComplete = new Chart(document.getElementById('chartHHComplete').getContext('2d'), { type: 'bar', data: {}, options: { responsive: true } });
const chartHIVResult = new Chart(document.getElementById('chartHIVResult').getContext('2d'), { type: 'bar', data: {}, options: { responsive: true } });
const chartTestingComplete = new Chart(document.getElementById('chartTestingComplete').getContext('2d'), { type: 'bar', data: {}, options: { responsive: true } });

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    populateFilters();
    updateDashboard(rawData);
  };

  reader.readAsArrayBuffer(file);
});

function populateFilters() {
  const regions = [...new Set(rawData.map(d => d.Region).filter(Boolean))];
  const districts = [...new Set(rawData.map(d => d.District).filter(Boolean))];

  regionFilter.innerHTML = '<option value="">All</option>';
  regions.forEach(r => regionFilter.innerHTML += `<option value="${r}">${r}</option>`);

  districtFilter.innerHTML = '<option value="">All</option>';
  districts.forEach(d => districtFilter.innerHTML += `<option value="${d}">${d}</option>`);
}

function renderTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    Object.keys(row).forEach(key => {
      const td = document.createElement("td");
      td.textContent = row[key] || '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function updateCharts(data) {
  const labels = data.map((_, i) => i + 1);

  chartHHComplete.data = {
    labels,
    datasets: [{ label: "HH Interviews Complete", data: data.map(d => Number(d["HH Interviews Complete?"] || 0)), backgroundColor: "#3498db" }]
  };
  chartHHComplete.update();

  chartHIVResult.data = {
    labels,
    datasets: [{ label: "HIV Final Result", data: data.map(d => Number(d["HIV Final Result"] || 0)), backgroundColor: "#2ecc71" }]
  };
  chartHIVResult.update();

  chartTestingComplete.data = {
    labels,
    datasets: [{ label: "Testing Complete?", data: data.map(d => Number(d["Testing Complete?"] || 0)), backgroundColor: "#e67e22" }]
  };
  chartTestingComplete.update();
}

function updateDashboard(data) {
  renderTable(data);
  updateCharts(data);
}

applyFilters.addEventListener("click", () => {
  const region = regionFilter.value;
  const district = districtFilter.value;
  const date = dateFilter.value;

  const filtered = rawData.filter(d =>
    (!region || d.Region === region) &&
    (!district || d.District === district) &&
    (!date || d["Date Completed"] === date)
  );

  updateDashboard(filtered);
});
