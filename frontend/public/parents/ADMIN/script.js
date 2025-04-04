document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("nav ul li").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll("nav ul li").forEach(li => li.classList.remove("active"));
            item.classList.add("active");
        });
    });
});
    