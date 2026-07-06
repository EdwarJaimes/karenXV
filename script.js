// Core navigation state
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const fills = document.querySelectorAll('.progress-fill');
const totalSlides = slides.length;
const slideDuration = 8000; // 8 seconds per slide
let slideTimer = null;
let progressStartTime = 0;
let progressRemainingTime = slideDuration;
let isPaused = false;

// Particles canvas setup
const particlesCanvas = document.getElementById('particles-canvas');
const pCtx = particlesCanvas.getContext('2d');
let particles = [];

// Canvas resizing
function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Classes (Hearts, Snowflakes, Butterflies)
class MagicParticle {
    constructor(x, y, type) {
        this.x = x || Math.random() * particlesCanvas.width;
        this.y = y || particlesCanvas.height + 20;
        this.type = type || ['heart', 'star', 'butterfly'][Math.floor(Math.random() * 3)];
        
        this.size = Math.random() * 8 + 4;
        if (this.type === 'butterfly') this.size = Math.random() * 12 + 8;
        
        this.speedX = Math.random() * 2 - 1;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.opacity = Math.random() * 0.7 + 0.3;
        this.color = this.getRandomColor();
        this.angle = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    getRandomColor() {
        // Pastel pink and icy frozen blue palette
        const colors = [
            'rgba(255, 182, 193, opacity)', // Pastel Pink
            'rgba(255, 209, 220, opacity)', // Light Pink
            'rgba(169, 221, 247, opacity)', // Frozen Blue
            'rgba(224, 247, 250, opacity)', // Pale Turquoise
            'rgba(255, 255, 255, opacity)', // Magical White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX + Math.sin(this.angle) * 0.5;
        this.y += this.speedY;
        this.angle += this.wobbleSpeed;
        
        // Wrap around horizontal bounds
        if (this.x < -10) this.x = particlesCanvas.width + 10;
        if (this.x > particlesCanvas.width + 10) this.x = -10;
        
        // Gradually fade out as it reaches the top
        if (this.y < particlesCanvas.height * 0.2) {
            this.opacity -= 0.01;
        }
    }

    draw() {
        const c = this.color.replace('opacity', this.opacity.toFixed(2));
        pCtx.save();
        pCtx.translate(this.x, this.y);
        pCtx.fillStyle = c;
        
        if (this.type === 'heart') {
            pCtx.beginPath();
            pCtx.moveTo(0, 0);
            pCtx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, this.size/3, 0, this.size);
            pCtx.bezierCurveTo(this.size, this.size/3, this.size/2, -this.size/2, 0, 0);
            pCtx.fill();
        } else if (this.type === 'star') {
            // Shiny snowflake/star
            pCtx.strokeStyle = c;
            pCtx.lineWidth = 1.5;
            pCtx.beginPath();
            for(let i=0; i<6; i++) {
                pCtx.rotate(Math.PI / 3);
                pCtx.moveTo(0, 0);
                pCtx.lineTo(0, this.size);
                pCtx.moveTo(0, this.size * 0.6);
                pCtx.lineTo(-this.size*0.2, this.size*0.4);
                pCtx.moveTo(0, this.size * 0.6);
                pCtx.lineTo(this.size*0.2, this.size*0.4);
            }
            pCtx.stroke();
        } else if (this.type === 'butterfly') {
            pCtx.rotate(Math.sin(this.angle * 2) * 0.2); // fluttering wing effect
            
            // Left wing
            pCtx.beginPath();
            pCtx.ellipse(-this.size/2, -this.size/4, this.size/2, this.size/3, Math.PI/6, 0, Math.PI*2);
            pCtx.ellipse(-this.size/3, this.size/4, this.size/3, this.size/4, -Math.PI/6, 0, Math.PI*2);
            pCtx.fill();
            
            // Right wing
            pCtx.beginPath();
            pCtx.ellipse(this.size/2, -this.size/4, this.size/2, this.size/3, -Math.PI/6, 0, Math.PI*2);
            pCtx.ellipse(this.size/3, this.size/4, this.size/3, this.size/4, Math.PI/6, 0, Math.PI*2);
            pCtx.fill();
            
            // Body
            pCtx.fillStyle = '#ffffff';
            pCtx.beginPath();
            pCtx.ellipse(0, 0, 2, this.size/2, 0, 0, Math.PI*2);
            pCtx.fill();
        }
        
        pCtx.restore();
    }
}

// Particle system loop
function handleParticles() {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    // Periodically generate particles
    if (particles.length < 40 && Math.random() < 0.15) {
        particles.push(new MagicParticle());
    }
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].opacity <= 0 || particles[i].y < -20) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(handleParticles);
}
handleParticles();

// Spawn bursting particles at custom coordinates
function spawnBurst(x, y, count, type) {
    for (let i = 0; i < count; i++) {
        const p = new MagicParticle(x, y, type);
        p.speedX = Math.random() * 6 - 3;
        p.speedY = Math.random() * -6 - 2;
        p.opacity = 1;
        particles.push(p);
    }
}

// Sparkle tap reactions
window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    spawnBurst(touch.clientX, touch.clientY, 8, 'star');
});

// Interactive Web Audio Synth (Ambient Music Box)
let audioCtx = null;
let isMusicPlaying = false;
let melodyTimeout = null;

// Lullaby notes frequency & duration array (magical bells)
const melody = [
    {note: 'G5', dur: 500}, {note: 'E5', dur: 500}, {note: 'G5', dur: 500}, {note: 'C6', dur: 1000},
    {note: 'B5', dur: 500}, {note: 'A5', dur: 500}, {note: 'G5', dur: 1000},
    {note: 'A5', dur: 500}, {note: 'F5', dur: 500}, {note: 'A5', dur: 500}, {note: 'D6', dur: 1000},
    {note: 'C6', dur: 500}, {note: 'B5', dur: 500}, {note: 'C6', dur: 1500},
];

const noteFreqs = {
    'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66
};

function playTone(freq, duration) {
    if (!audioCtx) return;
    
    // Bells/Music Box Synthesis
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle'; // Sweet soft chime base
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Add subharmonic to make it feel warmer
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq / 2, audioCtx.currentTime);
    
    // Gain envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration/1000 - 0.05); // Decay
    
    subGain.gain.setValueAtTime(0, audioCtx.currentTime);
    subGain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.08);
    subGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration/1000 - 0.05);
    
    osc.connect(gainNode);
    subOsc.connect(subGain);
    
    gainNode.connect(audioCtx.destination);
    subGain.connect(audioCtx.destination);
    
    osc.start();
    subOsc.start();
    
    osc.stop(audioCtx.currentTime + duration/1000);
    subOsc.stop(audioCtx.currentTime + duration/1000);
}

let noteIndex = 0;
function playMelodyLoop() {
    if (!isMusicPlaying) return;
    
    const current = melody[noteIndex];
    const freq = noteFreqs[current.note];
    playTone(freq, current.dur);
    
    noteIndex = (noteIndex + 1) % melody.length;
    melodyTimeout = setTimeout(playMelodyLoop, current.dur + 100);
}

function startMusic() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    isMusicPlaying = true;
    playMelodyLoop();
}

function stopMusic() {
    isMusicPlaying = false;
    clearTimeout(melodyTimeout);
}

const musicBtn = document.getElementById('music-btn');
musicBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering slide navigation
    if (isMusicPlaying) {
        stopMusic();
        musicBtn.classList.remove('playing');
    } else {
        startMusic();
        musicBtn.classList.add('playing');
    }
});

// Slides Navigation Control
function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Pause any slide timer
    clearTimeout(slideTimer);
    
    // Update active classes
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    
    currentSlide = index;
    isPaused = false;
    
    // Fill up progress bars prior to this one, empty those after
    fills.forEach((fill, idx) => {
        if (idx < index) {
            fill.style.width = '100%';
        } else if (idx > index) {
            fill.style.width = '0%';
        }
    });
    
    // Custom triggers per slide
    if (index === 3) {
        // Slide 4: Waiting for gift click. Wait to continue.
        fills[index].style.width = '0%';
    } else if (index === 4) {
        // Slide 5: Scratch slide. Don't auto-progress.
        fills[index].style.width = '0%';
        initScratchCard();
    } else {
        // Normal sliding page
        startSlideTimer();
    }
}

function startSlideTimer() {
    progressStartTime = Date.now();
    progressRemainingTime = slideDuration;
    updateProgressFill();
}

function updateProgressFill() {
    if (isPaused) return;
    
    const elapsed = Date.now() - progressStartTime;
    const pct = Math.min((elapsed / slideDuration) * 100, 100);
    fills[currentSlide].style.width = `${pct}%`;
    
    if (elapsed < slideDuration) {
        slideTimer = requestAnimationFrame(updateProgressFill);
    } else {
        // Automatically move forward
        nextSlide();
    }
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        showSlide(currentSlide + 1);
    } else {
        // Loop back to start or stay on scratch card
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }
}

// Navigation Zones listeners
document.getElementById('nav-left').addEventListener('click', prevSlide);
document.getElementById('nav-right').addEventListener('click', () => {
    // If we are on slide 4 and gift isn't open, or slide 5 and it isn't scratched, still allow tapping to proceed manually
    nextSlide();
});

// Interactive Gift Box Logic
const giftBox = document.getElementById('gift-box');
const giftMsg = document.getElementById('gift-message');

giftBox.classList.add('shake');
giftBox.addEventListener('click', (e) => {
    e.stopPropagation();
    if (giftBox.classList.contains('open')) return;
    
    // Stop shaking, add open
    giftBox.classList.remove('shake');
    giftBox.classList.add('open');
    
    // Play chime sound
    if (audioCtx) {
        playTone(1046.50, 200); // C6 chime
        setTimeout(() => playTone(1318.51, 400), 100); // E6 chime
    }
    
    // Explode butterflies from box
    const rect = giftBox.getBoundingClientRect();
    spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2, 25, 'butterfly');
    spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2, 15, 'star');
    
    setTimeout(() => {
        giftBox.classList.add('hidden');
        giftMsg.classList.remove('hidden');
        setTimeout(() => {
            giftMsg.classList.add('visible');
            // Auto progress after she reads the gift (e.g. 5 seconds)
            setTimeout(() => {
                nextSlide();
            }, 5000);
        }, 100);
    }, 800);
});

// Interactive Scratch Card Logic
let scratchCanvasInitialized = false;

function initScratchCard() {
    if (scratchCanvasInitialized) return;
    
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Clear and draw cover
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gradients cover
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#A9DDF7'); // Frozen Blue
    grad.addColorStop(0.5, '#FFD1DC'); // Pastel Pink
    grad.addColorStop(1, '#FFF0F5');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Decorative magical snowflakes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '24px serif';
    ctx.fillText('❄️', 30, 60);
    ctx.fillText('❄️', 260, 90);
    ctx.fillText('❄️', 70, 310);
    ctx.fillText('❄️', 240, 280);
    ctx.fillText('✨', 150, 40);
    ctx.fillText('✨', 140, 330);
    
    // Instructional text
    ctx.fillStyle = '#4a6fa5';
    ctx.font = 'bold 22px "Quicksand", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Rasca con tu dedo', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px "Quicksand", sans-serif';
    ctx.fillText('para ver el deseo ✨', canvas.width / 2, canvas.height / 2 + 10);
    
    // Drawing setup
    let isDrawing = false;
    
    function scratch(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        // Handle touch or mouse coordinates
        const x = (e.targetTouches ? e.targetTouches[0].clientX : e.clientX) - rect.left;
        const y = (e.targetTouches ? e.targetTouches[0].clientY : e.clientY) - rect.top;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Spawn sparks while scratching
        if (Math.random() < 0.3) {
            const pageRect = canvas.getBoundingClientRect();
            const pageX = (e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
            const pageY = (e.targetTouches ? e.targetTouches[0].clientY : e.clientY);
            spawnBurst(pageX, pageY, 2, 'star');
        }
        
        checkScratchPercentage();
    }
    
    function checkScratchPercentage() {
        // Run sparingly
        if (Math.random() > 0.08) return;
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        let transparentPixels = 0;
        
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 0) transparentPixels++;
        }
        
        const pct = (transparentPixels / (pixels.length / 4)) * 100;
        
        // If scratched more than 45%, clear completely with a beautiful fade
        if (pct > 45) {
            canvas.style.transition = 'opacity 1s ease';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.style.display = 'none';
                // Explode massive congratulations confetti
                const rect = canvas.getBoundingClientRect();
                spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2, 40, 'butterfly');
                spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2, 20, 'star');
                // Play final birthday chord
                if (audioCtx) {
                    playTone(261.63, 100); // C4
                    playTone(329.63, 100); // E4
                    playTone(392.00, 100); // G4
                    playTone(523.25, 600); // C5
                }
            }, 1000);
        }
    }
    
    // Event listeners for desktop & mobile drawing
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => { isDrawing = false; });
    
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('touchmove', (e) => { 
        e.preventDefault(); // Prevents scroll behavior while scratching
        scratch(e); 
    });
    window.addEventListener('touchend', () => { isDrawing = false; });
    
    scratchCanvasInitialized = true;
}

// Initial Kick-off
showSlide(0);
