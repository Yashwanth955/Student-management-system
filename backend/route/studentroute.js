const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
    res.json({
        name: "John Doe",
        courses: [
            { course: "Math", value: 80 },
            { course: "Science", value: 90 },
            { course: "History", value: 70 }
        ],
        grades: [
            { course: "Math", value: "A" },
            { course: "Science", value: "B+" },
            { course: "History", value: "A-" }
        ]
    });
});

module.exports = router;
