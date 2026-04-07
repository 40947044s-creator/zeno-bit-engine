// Replace everything from function tick() down to the end of updateDOM()

// --- THE GENETIC BOOLEAN KERNEL ---

let frameCounter = 0; // Used to slow down the visual updates so the screen doesn't freeze
// --- STATE CONTROLS (Pause & Reset) ---

function togglePause() {
    const btn = document.getElementById('toggleBtn');
    
    if (isRunning) {
        // Freeze the universe
        isRunning = false;
        cancelAnimationFrame(animationId);
        
        // Update UI to show it is paused
        btn.innerText = "Resume Universe";
        btn.style.background = "#ffaa00"; // Change to yellow warning color
        
        saveState(); // Save the exact keystrokes in case they close the tab while paused
        console.log("Universe Paused. Wave function frozen.");
    } else {
        // Resume the universe
        isRunning = true;
        
        // Update UI to show it is running
        btn.innerText = "Pause Universe";
        btn.style.background = "#00ff41"; // Back to hacker green
        
        console.log("Universe Resumed. Re-engaging Boolean collisions.");
        tick(); // Restart the engine loop
    }
}

function resetUniverse() {
    // Wipe the offline memory
    totalKeystrokes = 0;
    localStorage.removeItem('zeno_totalKeystrokes');
    
    // Restart the simulation from scratch
    startSimulation();
}

// Update your existing startSimulation function slightly to ensure 
// the pause button resets visually when you change the target word:
function startSimulation() {
    targetStr = document.getElementById('target').value;
    const numMonkeys = parseInt(document.getElementById('monkeyCount').value);
    const len = targetStr.length;
    
    if (len === 0) return;

    // Allocate fresh memory
    monkeyBuffers = Array.from({ length: numMonkeys }, () => Array(len).fill(' '));
    monkeyScores = new Int32Array(numMonkeys);
    
    calculateMath();
    
    // Reset toggle button UI
    document.getElementById('toggleBtn').innerText = "Pause Universe";
    document.getElementById('toggleBtn').style.background = "#00ff41";
    
    isRunning = true;
    if (animationId) cancelAnimationFrame(animationId);
    tick();
}
function tick() {
    if (!isRunning) return;

    // 1. Evaluate Fitness of the current universe
    let bestScore = -1;
    let topMonkeys = [];

    for (let i = 0; i < monkeyBuffers.length; i++) {
        let buffer = monkeyBuffers[i];
        let score = 0;
        for (let s = 0; s < targetStr.length; s++) {
            if (buffer[s] === targetStr[s]) score++;
        }
        monkeyScores[i] = score;

        if (score > bestScore) bestScore = score;

        // Keep track of the top performers to act as "Parents"
        if (score > (targetStr.length / 3)) { // Only let the somewhat-good monkeys breed
            topMonkeys.push(buffer.slice()); 
        }
    }

    // 2. THE BOOLEAN COLLISION (Cross-Over & Mutation)
    if (topMonkeys.length > 2) {
        for (let i = 0; i < monkeyBuffers.length; i++) {
            // Keep the absolute best monkeys untouched (Elitism)
            if (monkeyScores[i] === bestScore) continue; 

            // Pick two random parents from the top pool
            let parentA = topMonkeys[Math.floor(Math.random() * topMonkeys.length)];
            let parentB = topMonkeys[Math.floor(Math.random() * topMonkeys.length)];
            
            // Boolean Multiplexer: Take some from A, some from B
            for (let c = 0; c < targetStr.length; c++) {
                // 50% chance to take from Parent A or Parent B
                monkeyBuffers[i][c] = (Math.random() > 0.5) ? parentA[c] : parentB[c];
                
                // XOR Mutation: 5% chance the bit flips entirely to random noise
                if (Math.random() < 0.05) {
                    monkeyBuffers[i][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                }
            }
        }
    } else {
        // If no monkeys are good yet, just mutate randomly (XOR noise)
        for (let i = 0; i < monkeyBuffers.length; i++) {
            let randIdx = Math.floor(Math.random() * targetStr.length);
            monkeyBuffers[i][randIdx] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
    }

    totalKeystrokes += monkeyBuffers.length;

    // 3. UI THROTTLING (This fixes your screen freezing)
    frameCounter++;
    if (frameCounter % 10 === 0) { // Only update the screen every 10 frames
        document.getElementById('total-keys').innerText = totalKeystrokes.toLocaleString();
        
        let sortedIndices = Array.from(monkeyScores.keys()).sort((a, b) => monkeyScores[b] - monkeyScores[a]);
        updateDOM(sortedIndices.slice(0, 10));
    }

    // 4. Halt Condition
    if (bestScore === targetStr.length) {
        isRunning = false;
        // Force one final draw
        let sortedIndices = Array.from(monkeyScores.keys()).sort((a, b) => monkeyScores[b] - monkeyScores[a]);
        updateDOM(sortedIndices.slice(0, 10));
        console.log(`Truth String Found via Boolean Evolution in ${totalKeystrokes} keystrokes.`);
    } else {
        animationId = requestAnimationFrame(tick);
    }
}

    // Global Stats
    totalKeystrokes += monkeyBuffers.length;
    document.getElementById('total-keys').innerText = totalKeystrokes.toLocaleString();

    // Update UI instantly
    updateDOM(top10Ids);

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
        if (monkeyIndex === -1) return; // Ignore empty slots before the board fills up

        const buffer = monkeyBuffers[monkeyIndex];
        const score = monkeyScores[monkeyIndex];
        
        let htmlStr = "";
        for(let i=0; i < buffer.length; i++) {
            if(buffer[i] === targetStr[i]) htmlStr += `<span class="match">${buffer[i]}</span>`;
            else htmlStr += buffer[i];
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
