const users = [
    { name: "Ibrahim", open: 5, ongoing: 3, closed: 7 },
    { name: "Amina", open: 2, ongoing: 4, closed: 6 },
    { name: "Urio", open: 3, ongoing: 2, closed: 5 },
    { name: "Monica", open: 1, ongoing: 5, closed: 8 },
    { name: "Joseph", open: 4, ongoing: 3, closed: 9 },
];

// Prepare data for Chart.js
const labels = users.map(u => u.name);
const dataOpen = users.map(u => u.open);
const dataOngoing = users.map(u => u.ongoing);
const dataClosed = users.map(u => u.closed);

const ctx = document.getElementById('ticketChart').getContext('2d');
const ticketChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [
            { label: 'Open', data: dataOpen, backgroundColor: '#f39c12' },
            { label: 'Ongoing', data: dataOngoing, backgroundColor: '#3498db' },
            { label: 'Closed', data: dataClosed, backgroundColor: '#2ecc71' },
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Ticket Status by User' }
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    }
});
