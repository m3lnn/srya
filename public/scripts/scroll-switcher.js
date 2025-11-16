const mainHeader = document.getElementById('mainHeader');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const content = document.getElementById('content');
const heading = document.getElementById('heading');
const headerImage = document.getElementById('headerImage');

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

const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600',
    'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1600',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600'
];

const headings = [
    'software is eating the world',
    'finding my place between beauty and practicality',
    'making beautiful things',
    'autodidactic',
    'designing with craft and compassion'
];

let pixelStates = [];
let pixelOrder = [];
let decorativePixels = [];
let startY = 0;
let currentPull = 0;
let reachedThreshold = false;
let currentSetIndex = 0;
let nextSetIndex = 0;
let currentImageIndex = 0;
let nextImageIndex = 0;

// Pick random starting values
currentSetIndex = Math.floor(Math.random() * colorSets.length);
currentImageIndex = Math.floor(Math.random() * images.length);
headerImage.src = images[currentImageIndex];

function initPixels() {
    pixelStates = new Array(totalPixels).fill(0);
    pixelOrder = Array.from({length: totalPixels}, (_, i) => i);
    
    // Shuffle array
    for (let i = pixelOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pixelOrder[i], pixelOrder[j]] = [pixelOrder[j], pixelOrder[i]];
    }
    
    generateDecorativePixels();
}

function generateDecorativePixels() {
    decorativePixels = [];
    const numDecorativePixels = Math.floor(Math.random() * 6) + 5;
    const bottomRows = 3;
    const startPixel = totalPixels - (gridWidth * bottomRows);
    
    const availablePixels = Array.from({length: gridWidth * bottomRows}, (_, i) => startPixel + i);
    
    for (let i = availablePixels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePixels[i], availablePixels[j]] = [availablePixels[j], availablePixels[i]];
    }
    
    decorativePixels = availablePixels.slice(0, numDecorativePixels);
}

function applyThemeColors() {
    const primaryColor = colorSets[currentSetIndex][0];
    const secondaryColor = colorSets[currentSetIndex][1];

    document.documentElement.style.setProperty('--themed-primary', primaryColor);
    document.documentElement.style.setProperty('--themed-secondary', secondaryColor);
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
    
    // Check if we're transitioning
    let isTransitioning = pixelStates.some(state => state === 1);
    
    if (isTransitioning) {
        // Draw active pixels during transition
        for (let i = 0; i < totalPixels; i++) {
            if (pixelStates[i] === 1) {
                const x = Math.floor((i % gridWidth) * (canvas.width / gridWidth));
                const y = Math.floor(Math.floor(i / gridWidth) * (canvas.height / gridHeight));
                
                ctx.fillStyle = colorSets[currentSetIndex][0];
                ctx.fillRect(x, y, pixelWidth, pixelHeight);
            }
        }
    } else {
        // Draw only decorative pixels when idle
        decorativePixels.forEach(pixelIndex => {
            const x = Math.floor((pixelIndex % gridWidth) * (canvas.width / gridWidth));
            const y = Math.floor(Math.floor(pixelIndex / gridWidth) * (canvas.height / gridHeight));
            
            ctx.fillStyle = colorSets[currentSetIndex][0];
            ctx.fillRect(x, y, pixelWidth, pixelHeight);
        });
    }
}

function updatePixels(progress) {
    const pixelsToTurn = Math.floor(progress * totalPixels);
    
    pixelStates.fill(0);
    for (let i = 0; i < pixelsToTurn; i++) {
        pixelStates[pixelOrder[i]] = 1;
    }
    
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
    nextImageIndex = getRandomIndex(currentImageIndex, images.length);
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
        currentImageIndex = nextImageIndex;
        heading.textContent = headings[Math.floor(Math.random() * headings.length)];
    }
    
    pixelStates.fill(0);
    
    applyThemeColors();
    
    currentPull = 0;
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
            nextImageIndex = getRandomIndex(currentImageIndex, images.length);
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