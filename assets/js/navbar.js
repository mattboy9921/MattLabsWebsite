// Wait for page to load before beginning
document.addEventListener('DOMContentLoaded', function () {
    // Prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener('change', () => {
        prefersReducedMotion = mediaQuery.matches;
    });

    // Element visibility on open of offcanvas navbar

    // Get offcanvas
    const offcanvas = document.getElementById('offcanvasNavbar');
    // Get nav links
    const navLinks = [...document.getElementsByClassName('nav-link-ml')]
    // Get search
    navLinks.push(document.getElementById('nav-search'));

    // Create array for elements to hide
    let contents = [];

    // Get navbar toggler
    const navbarToggler = document.getElementById('navbar-toggler');
    contents.push(navbarToggler);
    // Get contact
    contents.push(document.getElementById('socials'));
    // Get content
    contents.push(document.getElementById('content'));

    // Open
    offcanvas.addEventListener('show.bs.offcanvas', function () {
        // Hide content
        contents.forEach(element => {
            element.classList.add('nav-offcanvas-open-hide');
        })
        // Keep navbar visible
        navbar.classList.add('nav-visible');

        // Stagger nav link reveal
        navLinks.forEach((element, index) => {
            const timeout = prefersReducedMotion ? 0 : index * 200 + 300;
            setTimeout(function () {
                element.classList.add('nav-link-visible');
            }, timeout);
        });
    });

    // Close
    offcanvas.addEventListener('hide.bs.offcanvas', function () {
        // Show content
        contents.forEach(element => {
            element.classList.remove('nav-offcanvas-open-hide');
        });
    });

    // Closed
    offcanvas.addEventListener('hidden.bs.offcanvas', function () {
        // Hide nav links
        navLinks.forEach(element => {
            element.classList.remove('nav-link-visible');
        });
    });

    // Navbar visibility on first load and toggler bounce

    // Get navbar
    const navbar = document.getElementById('nav-home');

    // Get subtext
    const subText = document.getElementById('sub-text');

    // Wait for subtext animation to play then play navbar animation
    subText.addEventListener('animationstart', function () {
        // Prevent animation from playing when offcanvas showing
        if (!navbar.classList.contains('nav-visible')) {
            // Navbar fade
            navbar.classList.add('nav-fade-animation');
            // Navbar toggler bounce animation
            navbarToggler.classList.add('navbar-toggler-bounce');
        }
    });
});