const mainHeader = document.getElementById('mainHeader');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const content = document.getElementById('content');
const heading = document.getElementById('heading');
const body = document.body;

const basePadding = 40;
const maxPadding = 120;
const threshold = 80;

const gridWidth = 100;
const gridHeight = 30;
const totalPixels = gridWidth * gridHeight;

const colorSets = [
    ['#FF6542', '#393939'],
    ['#E80051', '#FFFFFF'],
    ['#F6AD00', '#FFF1D0'],
    ['#009B72', '#393939'],
    ['#393939', '#FFFFED'],
    ['#9747FF', '#FFFFED'],
    ['#0017E8', '#FFFFED'],
    ['#FF12AF', '#FFFFED'],
];

const headings = [
    'software is eating the world',
    'finding my place between beauty and practicality',
    'make beautiful things',
    'autodidactic',
    'designing with craft and compassion'
];

let pixelStates = [];
let pixelOrder = [];
let startY = 0;
let currentPull = 0;
let reachedThreshold = false;
let currentSetIndex = 0;
let nextSetIndex = 0;

// Initialize pixel states and create random order
function initPixels() {
    pixelStates = new Array(totalPixels).fill(0);
    pixelOrder = Array.from({length: totalPixels}, (_, i) => i);
    
    // Shuffle array
    for (let i = pixelOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pixelOrder[i], pixelOrder[j]] = [pixelOrder[j], pixelOrder[i]];
    }
}



function applyThemeColors() {
    const primaryColor = colorSets[currentSetIndex][0];
    const secondaryColor = colorSets[currentSetIndex][1];
    
    // Background + main text
    body.style.backgroundColor = primaryColor;
    content.style.color = secondaryColor;

    // Update link colors
    document.querySelectorAll('a').forEach(a => {
        a.style.color = primaryColor;
    });

    // Optional: update other accent elements
    document.querySelectorAll('.themed').forEach(el => {
        el.style.color = primaryColor;
    });

    document.querySelectorAll('.themed-text').forEach(el => {
        el.style.color = secondaryColor;
    });
}

function getRandomIndex(currentIndex, arrayLength) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * arrayLength);
    } while (newIndex === currentIndex);
    return newIndex;
}

function resizeCanvas() {
    canvas.width = mainHeader.offsetWidth;
    canvas.height = mainHeader.offsetHeight;
    drawPixels();
}

function drawPixels() {
    const pixelWidth = Math.ceil(canvas.width / gridWidth);
    const pixelHeight = Math.ceil(canvas.height / gridHeight);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < totalPixels; i++) {
        const x = Math.floor((i % gridWidth) * (canvas.width / gridWidth));
        const y = Math.floor(Math.floor(i / gridWidth) * (canvas.height / gridHeight));
        
        const colorIndex = pixelStates[i] === 0 ? currentSetIndex : nextSetIndex;
        ctx.fillStyle = colorSets[colorIndex][0];
        ctx.fillRect(x, y, pixelWidth, pixelHeight);
    }
    
    applyThemeColors();

}


function updatePixels(progress) {
    const pixelsToTurn = Math.floor(progress * totalPixels);
    
    pixelStates.fill(0);
    for (let i = 0; i < pixelsToTurn; i++) {
        pixelStates[pixelOrder[i]] = 1;
    }
    
    // Switch text color at 50% progress
    const textColorIndex = progress > 0.5 ? nextSetIndex : currentSetIndex;
    content.style.color = colorSets[textColorIndex][1];
    
    drawPixels();
}

function setPadding(pull) {
    const newPadding = basePadding + pull;
    mainHeader.style.paddingTop = `${newPadding}px`;
    mainHeader.style.paddingBottom = `${newPadding}px`;
}

function handlePullStart(clientY) {
    if (window.scrollY !== 0) return false;
    
    startY = clientY;
    reachedThreshold = false;
    nextSetIndex = getRandomIndex(currentSetIndex, colorSets.length);
    return true;
}

function handlePullMove(clientY) {
    if (window.scrollY !== 0) return;
    
    const pullDistance = Math.max(0, clientY - startY);
    currentPull = Math.min(pullDistance, maxPadding - basePadding);
    
    setPadding(currentPull);
    
    const progress = currentPull / threshold;
    updatePixels(Math.min(progress, 1));
    
    if (currentPull >= threshold) {
        reachedThreshold = true;
    }
    
    resizeCanvas();
}

function handlePullEnd() {
    setPadding(0);
    
    if (reachedThreshold) {
        currentSetIndex = nextSetIndex;
        heading.textContent = headings[Math.floor(Math.random() * headings.length)];
    }
    
    pixelStates.fill(0);
    
    applyThemeColors();
    
    currentPull = 0;
    reachedThreshold = false;
    initPixels();
    resizeCanvas();
}

// Initialize
initPixels();
resizeCanvas();
applyThemeColors();
window.addEventListener('resize', resizeCanvas);

// Touch events
window.addEventListener('touchstart', (e) => {
    handlePullStart(e.touches[0].clientY);
});

window.addEventListener('touchmove', (e) => {
    handlePullMove(e.touches[0].clientY);
});

window.addEventListener('touchend', handlePullEnd);

// Mouse events
let isMouseDown = false;

window.addEventListener('mousedown', (e) => {
    if (handlePullStart(e.clientY)) {
        isMouseDown = true;
    }
});

window.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        handlePullMove(e.clientY);
    }
});

window.addEventListener('mouseup', () => {
    if (isMouseDown) {
        isMouseDown = false;
        handlePullEnd();
    }
});

// Wheel event
let wheelTimeout;
window.addEventListener('wheel', (e) => {
    if (window.scrollY === 0 && e.deltaY < 0) {
        e.preventDefault();
        
        if (currentPull === 0) {
            nextSetIndex = getRandomIndex(currentSetIndex, colorSets.length);
        }
        
        const pullAmount = Math.abs(e.deltaY) * 0.5;
        currentPull = Math.min(currentPull + pullAmount, maxPadding - basePadding);
        
        setPadding(currentPull);
        
        const progress = currentPull / threshold;
        updatePixels(Math.min(progress, 1));
        
        if (currentPull >= threshold) {
            reachedThreshold = true;
        }
        
        resizeCanvas();
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(handlePullEnd, 150);
    }
}, { passive: false });