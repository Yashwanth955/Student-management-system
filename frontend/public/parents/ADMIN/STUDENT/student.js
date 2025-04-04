document.addEventListener("DOMContentLoaded", function () {
    const studentForm = document.getElementById("studentForm");
    const studentTableBody = document.getElementById("studentTableBody");
    const editIndexInput = document.getElementById("editIndex");

    let students = JSON.parse(localStorage.getItem("students")) || [];

    function saveToLocalStorage() {
        localStorage.setItem("students", JSON.stringify(students));
    }

    function updateTable() {
        studentTableBody.innerHTML = "";

        students.forEach((student, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.usn}</td>
                <td>${student.department}</td>
                <td>${student.scgpa}</td>
                <td>${student.email}</td>
                <td>${student.cgpa}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editStudent(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteStudent(${index})">Delete</button>
                </td>
            `;

            studentTableBody.appendChild(row);
        });
    }

    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const usn = document.getElementById("usn").value;
        const department = document.getElementById("department").value;
        const scgpa = document.getElementById("scgpa").value;
        const email = document.getElementById("email").value;
        const cgpa = document.getElementById("cgpa").value;

        if (name.trim() === "" || usn.trim() === "" || department.trim() === "" || email.trim() === "" || scgpa === "" || cgpa === "") {
            alert("Please fill in all fields.");
            return;
        }

        const student = { name, usn, department, scgpa, email, cgpa };

        if (editIndexInput.value === "") {
            students.push(student);
        } else {
            students[editIndexInput.value] = student;
            editIndexInput.value = "";
        }

        saveToLocalStorage();
        updateTable();
        studentForm.reset();
    });

    window.editStudent = function (index) {
        const student = students[index];

        document.getElementById("name").value = student.name;
        document.getElementById("usn").value = student.usn;
        document.getElementById("department").value = student.department;
        document.getElementById("scgpa").value = student.scgpa;
        document.getElementById("email").value = student.email;
        document.getElementById("cgpa").value = student.cgpa;

        editIndexInput.value = index;
    };

    window.deleteStudent = function (index) {
        if (confirm("Are you sure you want to delete this student?")) {
            students.splice(index, 1);
            saveToLocalStorage();
            updateTable();
        }
    };

    updateTable();
});
