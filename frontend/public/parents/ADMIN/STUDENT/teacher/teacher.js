document.addEventListener("DOMContentLoaded", function () {
    const teacherForm = document.getElementById("teacherForm");
    const teacherTableBody = document.getElementById("teacherTableBody");
    const editIndexInput = document.getElementById("editIndex");

    let teachers = JSON.parse(localStorage.getItem("teachers")) || [];

    function saveToLocalStorage() {
        localStorage.setItem("teachers", JSON.stringify(teachers));
    }

    function updateTable() {
        teacherTableBody.innerHTML = "";

        teachers.forEach((teacher, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${teacher.name}</td>
                <td>${teacher.empId}</td>
                <td>${teacher.department}</td>
                <td>${teacher.experience} years</td>
                <td>${teacher.email}</td>
                <td>${teacher.salary}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editTeacher(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteTeacher(${index})">Delete</button>
                </td>
            `;

            teacherTableBody.appendChild(row);
        });
    }

    teacherForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const empId = document.getElementById("empId").value;
        const department = document.getElementById("department").value;
        const experience = document.getElementById("experience").value;
        const email = document.getElementById("email").value;
        const salary = document.getElementById("salary").value;

        if (name.trim() === "" || empId.trim() === "" || department.trim() === "" || experience === "" || email.trim() === "" || salary === "") {
            alert("Please fill in all fields.");
            return;
        }

        const teacher = { name, empId, department, experience, email, salary };

        if (editIndexInput.value === "") {
            teachers.push(teacher);
        } else {
            teachers[editIndexInput.value] = teacher;
            editIndexInput.value = "";
        }

        saveToLocalStorage();
        updateTable();
        teacherForm.reset();
    });

    window.editTeacher = function (index) {
        const teacher = teachers[index];

        document.getElementById("name").value = teacher.name;
        document.getElementById("empId").value = teacher.empId;
        document.getElementById("department").value = teacher.department;
        document.getElementById("experience").value = teacher.experience;
        document.getElementById("email").value = teacher.email;
        document.getElementById("salary").value = teacher.salary;

        editIndexInput.value = index;
    };

    window.deleteTeacher = function (index) {
        if (confirm("Are you sure you want to delete this teacher?")) {
            teachers.splice(index, 1);
            saveToLocalStorage();
            updateTable();
        }
    };

    updateTable();
});
