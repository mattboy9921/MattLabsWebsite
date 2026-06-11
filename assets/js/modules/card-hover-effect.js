// Mouse hover effect

document.querySelectorAll(".card-hover-effect-container").forEach(container => {
    container.addEventListener("mousemove", e => {
        for(const card of container.getElementsByClassName("card-hover-effect")) {
            const rect = card.getBoundingClientRect(),
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    });
});