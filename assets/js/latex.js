// All functions for the LaTeX side by side editor using Ace and SwiftLaTeX

// Get elements
const pdfbox = document.getElementById('pdfbox');
const outputContainer = document.getElementById('output-tab-container');
const logText = document.getElementById('log-text');
const compileButton = document.getElementById('compile-button');
const outputTab = document.getElementById('output-tab');
const outputTabPane = document.getElementById('output-tab-pane');
const logTab = document.getElementById('log-tab');
const logTabPane = document.getElementById('log-tab-pane');
const cardScroll = document.getElementById('card-scroll');
const pdfDownload = document.getElementById('pdf-download');

// Ace setup
const editor = ace.edit('editor');
editor.setTheme('ace/theme/tokyo_night');
editor.session.setMode('ace/mode/latex');
editor.setAutoScrollEditorIntoView(true);
editor.setOptions({
    showPrintMargin: false,
    behavioursEnabled: true,
    wrapBehavioursEnabled: true,
    wrap: 'free'
});

// Download Tex
function downloadAsTex() {
    // Create a blob with the text content
    const blob = new Blob([editor.getValue()], { type: 'text/plain' });

    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'latex.tex';

    // Append the link to the document body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// SwiftLaTeX setup
const engine = new PdfTeXEngine();
const pdfboxLoading = pdfbox.innerHTML;
let pregenLoaded = false;
let pdfURL = '/assets/pregen-resume.pdf'
let pdfblob;
initSwiftLaTeX();

// Listen for logs
document.addEventListener('logMessage', function (event) {
    var logType = event.detail.type;
    var logMessage = event.detail.message;

    // Process the log message based on its type
    if (logType === 'log') {
        logText.innerHTML = logText.innerHTML + new Date().toLocaleString() + ': ' + logMessage + '<br>';
    } else if (logType === 'error') {
        logText.innerHTML = logText.innerHTML + '<span id="log-error">' + new Date().toLocaleString() + '[Error]: ' + logMessage + '</span><br>';
    }

    // Scroll to the bottom
    cardScroll.scrollTop = cardScroll.scrollHeight;
});

// Scroll sync
editor.getSession().on('changeScrollTop', function (scroll) {
    const height = editor.getSession().getDocument().getLength() * editor.renderer.lineHeight - editor.renderer.$size.height;
    const percent = scroll / height;
    outputContainer.scrollTop = (outputContainer.scrollHeight - outputContainer.getBoundingClientRect().height) * percent;
});

outputContainer.addEventListener('scroll', function (event) {
    const scroll = event.target.scrollTop;
    const height = event.target.scrollHeight - event.target.getBoundingClientRect().height;
    const percent = scroll / height;
    editor.getSession().setScrollTop((editor.getSession().getDocument().getLength() * editor.renderer.lineHeight - editor.renderer.$size.height) * percent);
})


// Initialize SwiftLaTeX
async function initSwiftLaTeX() {
    await engine.loadEngine();
    console.log('Engine loaded');
    compileButton.disabled = false;

    logText.innerHTML = '<p>' + new Date().toLocaleString() + ': Engine loaded</p>';

    // Load pregen
    renderPDF();
    // Start first compile
    compile();
}

// Compile LaTeX
async function compile() {
    if(!engine.isReady()) {
        console.log('Engine not ready yet');
        return;
    }

    engine.writeMemFSFile('main.tex', editor.getValue());
    engine.setEngineMainFile('main.tex');

    compileButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    compileButton.disabled = true;
    pdfDownload.disabled = true;

    let r = await engine.compileLaTeX(); // r contains PDF binray and compilation log.

    if (r.status === 0) {
        pdfblob = new Blob([r.pdf], {type: 'application/pdf'});
        const objectURL = URL.createObjectURL(pdfblob);
        setTimeout(() => {
            URL.revokeObjectURL(objectURL);
        }, 30000);
        console.log(objectURL);
        pdfURL = objectURL;

        if (pregenLoaded) {
            // Create alert
            let alert = document.createElement('div');

            alert.className = 'alert alert-danger fade show text-center';
            alert.id = 'pdf-compile-alert';
            alert.setAttribute('role', 'alert');
            alert.setAttribute('data-bs-dismiss', 'alert');
            alert.textContent = 'The LaTeX PDF has been rendered. Click here to reload.';
            alert.onclick = function() {
                renderPDF();
            };

            document.getElementById('output-tab-container').appendChild(alert);
            pregenLoaded = false;
        }
        else {
            let alert = document.getElementById('pdf-compile-alert');
            if (alert) {
                alert.remove();
            }
            renderPDF();
        }
    }

    compileButton.innerHTML = '<span class="fa-solid fa-play"></span>';
    compileButton.disabled = false;
    pdfDownload.disabled = false;

    // Change active tab
    outputTab.classList.add('active');
    outputTabPane.classList.add('active', 'show');
    logTab.classList.remove('active');
    logTabPane.classList.remove('active', 'show');
}

// Tab scroll
logTab.addEventListener('shown.bs.tab', function (event) {
    cardScroll.scrollTop = cardScroll.scrollHeight;
});

async function renderPDF() {
    pdfbox.classList.add('pdf-loading');
    await waitForTransitionEnd(pdfbox);
    pdfbox.innerHTML = '';

    if (pdfURL === '/assets/pregen-resume.pdf') {
        pregenLoaded = true;

        // Create alert
        var alert = document.createElement('div');

        alert.className = 'alert alert-dark fade show text-center px-2 py-1';
        alert.id = 'pdf-pregen-alert';
        alert.setAttribute('role', 'alert');
        alert.setAttribute('data-bs-dismiss', 'alert');
        alert.textContent = 'Pre-generated Output';

        document.getElementById('output-tab-container').appendChild(alert);
    }

    if (!pregenLoaded) {
        const alert = document.getElementById('pdf-pregen-alert');
        if (alert) {
            alert.remove();
        }
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/js/pdfjs/4.0.379/build/pdf.worker.mjs";
    pdfjsLib.getDocument(pdfURL).promise.then(pdf => {
        // Loop through each page
        for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            // Render each page and append to container
            pdf.getPage(pageNum).then(page => renderPage(page, pageNum).then(() => {
                if (pageNum === pdf.numPages) {
                    pdfbox.classList.remove('pdf-loading');
                }
            }));
        }
    }).catch(error => {
        console.error('Error loading PDF:', error);
    });
}

function renderPage(page, pageNum) {
    const scales = { 1: 3.2, 2: 4 },
        defaultScale = 4,
        scale = scales[window.devicePixelRatio] || defaultScale;
    const viewport = page.getViewport({ scale });

    // Create container div for each page
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page w-100';
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Append canvas to container
    pageContainer.appendChild(canvas);
    pdfbox.appendChild(pageContainer);

    // Get canvas context and render page
    const context = canvas.getContext('2d');
    const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
        textLayer: "visible"
    });

    return renderTask.promise.then(() => {
        console.log(`Page ${pageNum} rendered`);
    }).catch(error => {
        console.error(`Error rendering page ${pageNum}:`, error);
    });
}

// Download PDF
function downloadAsPDF() {
    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfblob);
    link.download = 'Matt DiCristina Resume.pdf';

    // Append the link to the document body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Transition helper
function waitForTransitionEnd(element) {
    return new Promise(resolve => {
        function transitionEndHandler(event) {
            if (event.target === element) {
                element.removeEventListener('transitionend', transitionEndHandler);
                resolve();
            }
        }
        element.addEventListener('transitionend', transitionEndHandler);
    });
}