function showSection(sectionID) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionID).classList.remove('hidden');
}

// Chart.js for Reports & Attendance
document.addEventListener("DOMContentLoaded", function() {
    const ctxGrades = document.getElementById("gradesChart").getContext("2d");
    new Chart(ctxGrades, {
        type: "bar",
        data: {
            labels: ["Math", "Science", "History"],
            datasets: [{
                label: "Grades",
                data: [90, 85, 95],
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"]
            }]
        }
    });

    const ctxAttendance = document.getElementById("attendanceChart").getContext("2d");
    new Chart(ctxAttendance, {
        type: "doughnut",
        data: {
            labels: ["Present", "Absent"],
            datasets: [{
                data: [95, 5],
                backgroundColor: ["#36a2eb", "#ff6384"]
            }]
        }
    });
});
