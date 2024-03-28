// Fade out webpage when clicking links internally
document.addEventListener('DOMContentLoaded', function () {
    // Bail if animation not supported
    if (!window.AnimationEvent) {
        return;
    }
    // Loop through all a tags
    const anchors = document.getElementsByTagName('a');
    for (let idx = 0; idx < anchors.length; idx += 1) {
        // Ignore external links and same page links
        if (anchors[idx].hostname !== window.location.hostname || (anchors[idx].pathname === window.location.pathname && !anchors[idx].classList.contains('active'))) {
            continue;
        }
        // Defer location change for animation
        anchors[idx].addEventListener('click', function (event) {
            const fader = document.getElementById('fader'),
                anchor = event.currentTarget;

            const listener = function () {
                window.location = anchor.href;
                fader.removeEventListener('animationend', listener);
            };
            fader.addEventListener('animationend', listener);

            event.preventDefault();

            // Fade in fader
            fader.classList.add('fader-fade-in');
        });
    }

    // Caching fix
    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) {
            return;
        }
        const fader = document.getElementById('fader');
        fader.classList.remove('fader-fade-in');
    })
});