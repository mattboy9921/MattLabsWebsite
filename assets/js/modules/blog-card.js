// Mouse hover effect

console.log("blog.js loaded");
console.log(document.getElementById("latest-posts"));
console.log(document.getElementsByClassName("latest-post-card").length);

document.getElementById("latest-posts").onmousemove = e => {
    for(const card of document.getElementsByClassName("latest-post-card")) {
        const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    }
}