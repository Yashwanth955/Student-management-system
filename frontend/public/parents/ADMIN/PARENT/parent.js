document.addEventListener("DOMContentLoaded", function () {
    // Dummy Student Data (Replace with actual backend data)
    const studentData = {
        name: "John Doe",
        usn: "1RV21CS101",
        department: "Computer Science",
        attendance: 85,
        image: "student.jpg",
        cgpaData: [
            { semester: 1, scgpa: 8.5, cgpa: 8.5, marks: [{ subject: "Math", marks: 90 }, { subject: "Physics", marks: 85 }] },
            { semester: 2, scgpa: 8.7, cgpa: 8.6, marks: [{ subject: "Math", marks: 88 }, { subject: "Chemistry", marks: 92 }] },
            { semester: 3, scgpa: 8.8, cgpa: 8.7, marks: [{ subject: "DSA", marks: 89 }, { subject: "OOPS", marks: 86 }] },
            { semester: 4, scgpa: 9.0, cgpa: 8.8, marks: [{ subject: "DBMS", marks: 91 }, { subject: "AI", marks: 90 }] },
            { semester: 5, scgpa: 9.1, cgpa: 8.9, marks: [{ subject: "ML", marks: 92 }, { subject: "Web Dev", marks: 93 }] },
            { semester: 6, scgpa: 9.2, cgpa: 9.0, marks: [{ subject: "Cloud", marks: 91 }, { subject: "Cybersecurity", marks: 94 }] }
        ]
    };

    // Populate Student Profile
    document.getElementById("studentName").textContent = studentData.name;
    document.getElementById("studentUSN").textContent = studentData.usn;
    document.getElementById("studentDept").textContent = studentData.department;
    document.getElementById("attendance").textContent = studentData.attendance;
    document.getElementById("studentImage").src = studentData.image;

    // Calculate Overall CGPA
    let totalCGPA = studentData.cgpaData.reduce((sum, sem) => sum + sem.cgpa, 0);
    let overallCGPA = (totalCGPA / studentData.cgpaData.length).toFixed(2);
    document.getElementById("overallCGPA").textContent = overallCGPA;

    // Populate CGPA & SCGPA Table
    const cgpaTable = document.getElementById("cgpaTable");
    studentData.cgpaData.forEach((data, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>Semester ${data.semester}</td>
            <td>${data.scgpa}</td>
            <td>${data.cgpa}</td>
            <td><button onclick="viewSemesterMarks(${index})">View</button></td>
        `;
        cgpaTable.appendChild(row);
    });

    // View Marks for Selected Semester
    window.viewSemesterMarks = function (index) {
        const semesterMarks = studentData.cgpaData[index].marks;
        const marksTable = document.getElementById("semesterMarksTable");
        marksTable.innerHTML = "";
        semesterMarks.forEach((mark) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${mark.subject}</td><td>${mark.marks}</td>`;
            marksTable.appendChild(row);
        });
        document.getElementById("semesterMarksSection").style.display = "block";
    };

    // Close Marks Section
    window.closeMarks = function () {
        document.getElementById("semesterMarksSection").style.display = "none";
    };
});
