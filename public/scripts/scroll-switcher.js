const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const headerImage = document.getElementById('headerImage');
const paintingTitle = document.getElementById('paintingTitle');
const paintingArtist = document.getElementById('paintingArtist');
const paintingYear = document.getElementById('paintingYear');
const paintingMedium = document.getElementById('paintingMedium');

const basePadding = 40;
const maxPadding = 120;
const threshold = 80;

const gridWidth = 150;
const gridHeight = 50;
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

let paintings = [];
let pixelStates = [];
let pixelOrder = [];
let decorativePixels = [];
let startY = 0;
let currentPull = 0;
let reachedThreshold = false;
let currentSetIndex = 0;
let currentPaintingIndex = 0;

// Pick random starting color set
currentSetIndex = Math.floor(Math.random() * colorSets.length);

// Fetch painting data from Hugo-generated JSON
fetch('/painting/index.json')
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log('Loaded paintings:', data);
    paintings = data;
    if (paintings.length > 0) {
      initCanvas();
    } else {
      console.warn('No paintings found in JSON');
    }
  })
  .catch(err => {
    console.error('Failed to load paintings:', err);
    // Fallback: use a placeholder if no paintings are loaded
    paintings = [{
      title: "No paintings found",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
      artist: "",
      year: "",
      medium: ""
    }];
    initCanvas();
  });


function initCanvas() {
    if (paintings.length === 0) return;
    
    currentPaintingIndex = Math.floor(Math.random() * paintings.length);
    updatePaintingDisplay();
    applyThemeColors();
    initPixels();
    resizeCanvas();
      console.log("paintings", paintings)

}

function updatePaintingDisplay() {
    const painting = paintings[currentPaintingIndex];
    if (!painting) return;
    
    headerImage.src = painting.url_image;
    headerImage.alt = painting.title;
    
    if (paintingTitle) paintingTitle.textContent = painting.title;
    if (paintingArtist) paintingArtist.textContent = painting.artist ? `by ${painting.artist}` : '';
    if (paintingYear) paintingYear.textContent = painting.year || '';
    if (paintingMedium) paintingMedium.textContent = painting.medium || '';
}

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

    const bottomRows = 3;

    // Compute row indices
    const row1Start = totalPixels - gridWidth;           // bottom row
    const row2Start = totalPixels - gridWidth * 2;
    const row3Start = totalPixels - gridWidth * 3;

    // Row 1 (bottom row) → include all of them
    const row1 = Array.from(
        { length: gridWidth },
        (_, i) => row1Start + i
    );

    // Row 2 + Row 3 → pool of possible random picks
    const row2 = Array.from(
        { length: gridWidth },
        (_, i) => row2Start + i
    );
    const row3 = Array.from(
        { length: gridWidth },
        (_, i) => row3Start + i
    );

    const randomPool = [...row2, ...row3];

    // Decide how many random decorative pixels you want from rows 2–3
    const numRandomDecorative = Math.floor(Math.random() * 100) + 5;

    // Shuffle randomPool
    for (let i = randomPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomPool[i], randomPool[j]] = [randomPool[j], randomPool[i]];
    }

    // Take random ones from row 2 + row 3
    const randomSelected = randomPool.slice(0, numRandomDecorative);

    // Combine bottom row (full) + random picks
    decorativePixels = [...row1, ...randomSelected];
}

function applyThemeColors() {
    const primaryColor = colorSets[currentSetIndex][0];
    const secondaryColor = colorSets[currentSetIndex][1];

    document.documentElement.style.setProperty('--themed-primary', primaryColor);
    document.documentElement.style.setProperty('--themed-secondary', secondaryColor);
}

function resizeCanvas() {
    const mainHeader = document.getElementById('mainHeader');
    if (!mainHeader) return;
    
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
    const mainHeader = document.getElementById('mainHeader');
    if (!mainHeader) return;
    
    const newPadding = basePadding + pull;
    mainHeader.style.paddingTop = `${newPadding}px`;
    mainHeader.style.paddingBottom = `${newPadding}px`;
}

function handlePullStart(clientY) {
    if (window.scrollY !== 0) return false;
    
    startY = clientY;
    reachedThreshold = false;
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
    // Check if threshold was reached and switch theme/image
    if (reachedThreshold && paintings.length > 0) {
        // Switch to next painting
        currentPaintingIndex = (currentPaintingIndex + 1) % paintings.length;
        updatePaintingDisplay();
    }
    
    setPadding(0);
    
    pixelStates.fill(0);
    
    currentPull = 0;
    initPixels();
    resizeCanvas();
}

// Window resize handler
window.addEventListener('resize', resizeCanvas);

// Wheel event
let wheelTimeout;
window.addEventListener('wheel', (e) => {
    if (window.scrollY === 0 && e.deltaY < 0) {
        e.preventDefault();
        
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