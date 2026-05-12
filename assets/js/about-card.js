// About cards and filters

// About cards

// Mouse hover effect

document.getElementById("about-cards").onmousemove = e => {
    for(const card of document.getElementsByClassName("about-card")) {
        const rect = card.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    }
}

// Collapse buttons
const buttons = document.getElementsByClassName("about-item-expand-button")

for(const button of buttons) {
    // Get collapse element for this button
    const thisCollapse = document.querySelector(button.getAttribute("data-bs-target"));
    // Listen for when collapse is shown
    thisCollapse.addEventListener("show.bs.collapse", () => {
        // Rotate button via class add
        button.classList.add("about-item-expand-button-flip");
        // Get all collapse elements
        for(const collapse of document.getElementsByClassName("collapse")) {
            // Collapse all but the one we are clicking
            if (thisCollapse.id !== collapse.id) {
                const collapseInstance = bootstrap.Collapse.getInstance(collapse);
                if (collapseInstance && collapseInstance._isShown) {
                    collapseInstance.hide();
                }
            }
        }
    });
    document.querySelector(button.getAttribute("data-bs-target")).addEventListener("hide.bs.collapse", () => {
        button.classList.remove("about-item-expand-button-flip");
    });
}

// Filters

// Make category checkbox buttons work like a radio but can click again to deselect selected
const categories = document.querySelectorAll("#filter-categories input.btn-check")
categories.forEach(category => {
    category.addEventListener("click", () => {
        // Unchecked category is clicked
        if (category.checked) {
            // Uncheck everything
            categories.forEach(loopCategory => {
                loopCategory.checked = false;
            });
            // Just check that one
            category.checked = true;
        }
    });
    category.addEventListener("change", updateCategories);
});

// Get a collection of all the cards
const cards = document.querySelectorAll(".about-card");

// This function updates which of the cards are visible based on the category
function updateCategories() {
    // Create a list of checked categories and remove the prefix
    const activeCategories = Array.from(categories)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.id.replace("category-", ""));

    // Loop through and modify each card
    cards.forEach(card => {
        // Get data
        const category = card.getAttribute("data-category");

        // Check if the card matches a selected category
        const categoryMatch = activeCategories.length === 0 || activeCategories.includes(category);

        // Add or remove hide class
        if (categoryMatch) {
            card.classList.remove("about-card-hide-category");
        }
        else {
            card.classList.add("about-card-hide-category");
        }
    });

    // Update card visibility
    updateCards();
}

// This function updates which of the cards are visible based on the search
function updateSearch() {
    // Get text from search field
    const searchQuery = searchInput.value.length > 0 ? searchInput.value.toLowerCase().trim().split(" ") : [];

    // Loop through and modify each card
    cards.forEach(card => {
        // Get data
        const title = card.getAttribute("data-title");
        const subtitle = card.getAttribute("data-subtitle");
        const tags = card.getAttribute("data-tags");
        const content = card.getAttribute("data-content");

        // Clear highlighting
        // Mark elements
        const markHighlights = card.querySelectorAll("mark.search-highlight");
        markHighlights.forEach(mark => {
            const parent = mark.parentElement;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
        });
        // Badges
        const badgeHighlights = card.querySelectorAll(".badge-about-tag-deepdanger");
        badgeHighlights.forEach(badge => {
            badge.classList.remove("bg-ml-primary-subtle", "text-ml-primary-emphasis");
            badge.classList.add("bg-bluespace", "text-lightbluespace");
        })

        // Highlighting
        if (searchQuery.length > 0) {
            const queryRegex = new RegExp(`(${searchInput.value})`, "gi");
            [...card.children].forEach(child => {
                if (child.innerText.toLowerCase().includes(searchInput.value.toLowerCase())) {
                    // Check if the text is in a badge
                    if (child.classList.contains("badge") || child.querySelector(".badge")) {
                        [...child.children].forEach(grandchild => {
                            if (grandchild.innerText.toLowerCase().includes(searchInput.value.toLowerCase())) {
                                // Change badge colors
                                grandchild.classList.remove("bg-bluespace", "text-lightbluespace");
                                grandchild.classList.add("bg-ml-primary-subtle", "text-ml-primary-emphasis");
                            }
                        });
                    }
                    else {
                        // Add highlight
                        child.innerHTML = child.innerHTML.replace(queryRegex, `<mark class="search-highlight">$1</mark>`);
                    }
                }
            });
        }

        // Check if the card matches the search query (title, subtitle, tags, content)
        const searchMatch = searchQuery.length === 0 ||
            searchQuery.every(word =>
                title.includes(word) ||
                subtitle.includes(word) ||
                tags.includes(word) ||
                content.includes(word)
            );

        // Add class
        if (searchMatch) {
            card.classList.remove("about-card-hide-search");
        }
        else {
            card.classList.add("about-card-hide-search");
        }
    });

    // Update card visibility
    updateCards();
}

// This function hides and shows the cards based on their classes
function updateCards() {
    cards.forEach((card) => {
        // Update visible cards height for max-height transition
        if (!card.classList.contains("about-card-hidden")) {
            // Record initial height in data attribute
            card.setAttribute("data-height", card.scrollHeight + "px");
        }

        const scrollHeight = card.getAttribute("data-height");
        const hideCategory = card.classList.contains("about-card-hide-category");
        const hideSearch = card.classList.contains("about-card-hide-search");

        // Make the card hidden
        if (hideCategory || hideSearch) {
            // Set max-height temporarily and refresh DOM
            card.style.maxHeight = scrollHeight;
            void card.offsetHeight;

            // Add the hidden class
            card.classList.add("about-card-hidden");

            // Wait for transition
            card.addEventListener("transitionend", function waitForFadeOut(event) {
                if (event.propertyName === "opacity" && card.classList.contains("about-card-hidden")) {
                    // Turn off display of card
                    card.classList.add("d-none");

                    // If the card was expanded, collapse it
                    const collapse = card.querySelector(".collapse");
                    const collapseInstance = bootstrap.Collapse.getInstance(collapse);
                    if (collapseInstance && collapseInstance._isShown) {
                        collapseInstance.hide();
                    }
                }
                card.removeEventListener("transitionend", waitForFadeOut);
            });
        }
        // Make the card visible
        else {
            // Check if the card was previously hidden
            if (card.classList.contains("about-card-hidden")) {
                // Set max-height temporarily
                card.style.maxHeight = scrollHeight;
                // Set the card to display
                card.classList.remove("d-none");
                // Remove the hidden class after a short delay to prevent other changes trampling the transitions
                setTimeout(() => card.classList.remove("about-card-hidden"), 20);

                // Wait for transition
                card.addEventListener("transitionend", function waitForFadeIn() {
                    // Remove temporary max height
                    card.style.maxHeight = "none"

                    card.removeEventListener("transitionend", waitForFadeIn);
                });
            }
        }
    });

    // Show no results if all hidden
    const noResults = document.getElementById("no-results");
    setTimeout(() => {
        if (Array.from(cards).every(card => card.classList.contains("about-card-hidden"))) {
            noResults.classList.remove("d-none");
            noResults.classList.remove("about-card-hidden");
        }
        else {
            noResults.classList.add("about-card-hidden");
            noResults.addEventListener("transitionend", function waitForFadeOut(event) {
                if (event.propertyName === "opacity") {
                    // Turn off display of element
                    noResults.classList.add("d-none");
                }
                noResults.removeEventListener("transitionend", waitForFadeOut);
            });
        }
    }, 50);
}

// Search Bar

const searchInput = document.getElementById("filter-search-input");
const searchSubmit = document.getElementById("filter-search-submit");
const searchSuggestions = document.getElementById("search-suggestions");

// Show or hide search clear
function showSearchClear(showClear) {
    if (showClear) {
        searchSubmit.classList.remove("fa-magnifying-glass");
        searchSubmit.classList.add("fa-xmark");
    }
    else {
        searchSubmit.classList.remove("fa-xmark");
        searchSubmit.classList.add("fa-magnifying-glass");
    }
}

// When user clicks on search or clear icon
searchSubmit.addEventListener("click", () => {
    // Clear
    if (searchSubmit.classList.contains("fa-xmark")) {
        showSearchClear(false);
        searchInput.value = "";
    }
    // Search
    else if (searchInput.value !== "") {
        showSearchClear(true);
    }
    searchSuggestions.classList.add("d-none");
    updateSearch();
});

// Handle non-input key presses in search field
searchInput.addEventListener("keydown", (event) => {
    if (searchInput.value !== "") {
        const key = event.key;

        switch (key) {
            // Arrow keys move us up and down in suggestions
            case "ArrowUp":
            case "ArrowDown":
                // Make sure there are active suggestions
                if (searchSuggestions.children.length > 0) {
                    event.preventDefault();

                    const arrowDown = event.key === "ArrowDown";
                    const listItems = Array.from(searchSuggestions.children);
                    const activeItemIndex = listItems.findIndex(item => item.classList.contains("active"));

                    // We have an active item in the list
                    if (activeItemIndex >= 0) {
                        // Move active down or up
                        listItems[activeItemIndex].classList.remove("active");
                        if (arrowDown) {
                            // Only move active down if we aren't at bottom
                            if (activeItemIndex + 1 < listItems.length) {
                                listItems[activeItemIndex + 1].classList.add("active");
                            }
                            else {
                                listItems[activeItemIndex].classList.add("active");
                            }
                        }
                        else {
                            // Just remove active if we are at top of list
                            if (activeItemIndex - 1 >= 0) {
                                listItems[activeItemIndex - 1].classList.add("active");
                            }
                            else {
                                listItems[activeItemIndex].classList.remove("active");
                            }
                        }
                    }
                    else {
                        if (arrowDown) {
                            listItems[0].classList.add("active");
                        }
                    }
                }
                break;
            // Enter will insert the current suggestion (if there is one) and search
            case "Enter":
                event.preventDefault();

                // Find if a suggestion is selected
                const listItems = Array.from(searchSuggestions.children);
                const activeItemIndex = listItems.findIndex(item => item.classList.contains("active"));
                if (activeItemIndex >= 0) {
                    // Insert suggestion
                    searchInput.value = listItems[activeItemIndex].innerText;
                }

                // Trigger search update
                updateSearch();

                // Lose search focus
                searchInput.blur();

                searchSuggestions.classList.add("d-none");

                // Change icon
                showSearchClear(true);
                break;
        }
    }
})

// Suggestions

const tags = Array.from(document.getElementById("search-tags").options).map(option => option.value);

// Listen for input
searchInput.addEventListener("keyup", (event) => {
    const ignoredKeys = ["Enter", "ArrowUp", "ArrowDown"];
    if (!ignoredKeys.includes(event.key)) {
        if  (searchInput.value !== "") {
            // Clear suggestions
            searchSuggestions.innerHTML = "";

            // Filter tags based on input
            const filteredTags = tags
                .filter(tag => tag.toLowerCase().includes(searchInput.value.toLowerCase()))
                .sort((a, b) => {
                    const aIndex = a.toLowerCase().indexOf(searchInput.value.toLowerCase());
                    const bIndex = b.toLowerCase().indexOf(searchInput.value.toLowerCase());
                    return aIndex - bIndex; // lower index (earlier match) comes first
                });

            // Create list item elements and append
            const queryRegex = new RegExp(`(${searchInput.value})`, "gi");
            filteredTags.forEach(tag => {
                const listItem = document.createElement("button");
                listItem.classList.add("list-group-item", "list-group-item-action");
                listItem.type = "button";
                listItem.innerHTML = tag.replace(queryRegex, `<strong>$1</strong>`);

                // Add click listener
                listItem.addEventListener("click", () => {
                    searchInput.value = listItem.innerText;
                    searchSuggestions.classList.add("d-none");
                    showSearchClear(true);
                    updateSearch();
                });

                searchSuggestions.appendChild(listItem);
            });
            searchSuggestions.classList.remove("d-none");
        }
        // When search is empty, hide suggestions, reset icon and update
        else {
            searchSuggestions.classList.add("d-none");
            showSearchClear(false);
            updateSearch();
        }
    }
});

// Search container loses focus

searchContainer = document.getElementById("search-container");
let searchContainerFocusTimeout;

searchContainer.addEventListener("focusout", () => {
    // Short delay for focus move to child
    searchContainerFocusTimeout = setTimeout(() => {
        if (!searchContainer.contains(document.activeElement)) {
            searchSuggestions.classList.add("d-none");
        }
    }, 10);
});

// Cancel focus timeout if focus moved to child
searchContainer.addEventListener("focusin", () => {
    clearTimeout(searchContainerFocusTimeout);
});