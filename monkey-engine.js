const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ "; // 27 Characters

let targetStr = "";
let monkeyBuffers = [];
let monkeyScores = [];
let isRunning = false;
let animationId;
let totalKeystrokes = 0;

// --- PERSISTENCE ENGINE (Solves the Pause Problem) ---
function saveState() {
    localStorage.setItem('zeno_lastActive', Date.now());
    localStorage.setItem('zeno_totalKeystrokes', totalKeystrokes);
}

function loadState() {
    const lastActive = localStorage.getItem('zeno_lastActive');
    const savedKeystrokes = localStorage.getItem('zeno_totalKeystrokes');
    const numMonkeys = parseInt(document.getElementById('monkeyCount').value) || 10000;
    
    if (savedKeystrokes) {
        totalKeystrokes = parseInt(savedKeystrokes);
    }
    
    if (lastActive) {
        const timeAwaySec = Math.floor((Date.now() - parseInt(lastActive)) / 1000);
        // 60 frames per second * number of monkeys
        const missedKeystrokes = timeAwaySec * 60 * numMonkeys; 
        totalKeystrokes += missedKeystrokes;
        console.log(`Offline computation synced. Added ${missedKeystrokes} keystrokes.`);
    }
}

// Attach persistence to browser events
window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveState();
    else loadState();
});
window.addEventListener('beforeunload', saveState);

// --- MATH ENGINE ---
function calculateMath() {
    const len = document.getElementById('target').value.length;
    const monkeys = parseInt(document.getElementById('monkeyCount').value);
    
    // (27^L) / (monkeys * 60 keystrokes per second)
    let seconds = Math.pow(27, len) / (monkeys * 60);
    
    let displayTime;
    if (seconds < 60) displayTime = `${Math.round(seconds)} Seconds`;
    else if (seconds < 3600) displayTime = `${Math.round(seconds/60)} Minutes`;
    else if (seconds < 86400) displayTime = `${Math.round(seconds/3600)} Hours`;
    else if (seconds < 31536000) displayTime = `${Math.round(seconds/86400)} Days`;
    else displayTime = `${Math.toExponential(seconds / 31536000)} Years`;
    
    document.getElementById('math-time').innerText = displayTime;
}

// --- SIMULATION CORE ---
function startSimulation() {
    targetStr = document.getElementById('target').value;
    const numMonkeys = parseInt(document.getElementById('monkeyCount').value);
    const len = targetStr.length;
    
    if (len === 0) return;

    // Allocate memory
    monkeyBuffers = Array.from({ length: numMonkeys }, () => Array(len).fill(' '));
    monkeyScores = new Int32Array(numMonkeys);
    
    calculateMath();
    isRunning = true;
    if (animationId) cancelAnimationFrame(animationId);
    tick();
}

function getHammingScore(buffer) {
    let score = 0;
    for (let i = 0; i < targetStr.length; i++) {
        if (buffer[i] === targetStr[i]) score++;
    }
    return score;
}

function tick() {
    if (!isRunning) return;

    let bestScore = -1;

    // The Universe Loop
    for (let i = 0; i < monkeyBuffers.length; i++) {
        let buffer = monkeyBuffers[i];
        
        // Shift buffer left
        for (let j = 0; j < buffer.length - 1; j++) {
            buffer[j] = buffer[j + 1];
        }
        
        // New random keystroke
        buffer[buffer.length - 1] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

        // Evaluate Fitness
        let score = getHammingScore(buffer);
        monkeyScores[i] = score;

        if (score > bestScore) bestScore = score;
    }

    // Global Stats
    totalKeystrokes += monkeyBuffers.length;
    document.getElementById('total-keys').innerText = totalKeystrokes.toLocaleString();

    // Sort and Update UI (Top 10 only)
    let sortedIndices = Array.from(monkeyScores.keys()).sort((a, b) => monkeyScores[b] - monkeyScores[a]);
    updateDOM(sortedIndices.slice(0, 10));

    // Halt condition
    if (bestScore === targetStr.length) {
        isRunning = false;
        console.log("Truth String Found! Wave function collapsed.");
    } else {
        animationId = requestAnimationFrame(tick);
    }
}

function updateDOM(topIndices) {
    const list = document.getElementById('rankings');
    list.innerHTML = ''; 

    topIndices.forEach((monkeyIndex, rank) => {
        const buffer = monkeyBuffers[monkeyIndex];
        const score = monkeyScores[monkeyIndex];
        
        let htmlStr = "";
        for(let i=0; i < buffer.length; i++) {
            if(buffer[i] === targetStr[i]) {
                htmlStr += `<span class="match">${buffer[i]}</span>`;
            } else {
                htmlStr += buffer[i];
            }
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <span class="rank">#${rank + 1} (ID: ${monkeyIndex})</span>
            <span class="buffer">${htmlStr}</span>
            <span class="score">${score}/${targetStr.length}</span>
        `;
        list.appendChild(li);
    });
}

// --- AUTO START ---
window.onload = function() {
    loadState();
    setTimeout(startSimulation, 500); // 500ms cinematic delay
};
