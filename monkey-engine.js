// Replace everything from function tick() down to the end of updateDOM()

function tick() {
    if (!isRunning) return;

    let bestScore = -1;
    
    // THE OPTIMIZATION: Only track the Top 10 champions, don't sort the whole universe
    let top10Ids = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    let top10Scores = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

    // The Universe Loop
    for (let i = 0; i < monkeyBuffers.length; i++) {
        let buffer = monkeyBuffers[i];
        
        // Shift buffer left
        for (let j = 0; j < buffer.length - 1; j++) {
            buffer[j] = buffer[j + 1];
        }
        
        // New random keystroke
        buffer[buffer.length - 1] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

        // Evaluate Fitness (Inlined for maximum speed)
        let score = 0;
        for (let s = 0; s < targetStr.length; s++) {
            if (buffer[s] === targetStr[s]) score++;
        }
        
        monkeyScores[i] = score; // Save score for the UI
        if (score > bestScore) bestScore = score;

        // Instantly check if this monkey belongs on the Leaderboard
        if (score > top10Scores[9]) {
            let insertIdx = 9;
            // Find its rightful rank
            while (insertIdx > 0 && score > top10Scores[insertIdx - 1]) {
                insertIdx--;
            }
            // Shift the lower monkeys down
            for (let k = 9; k > insertIdx; k--) {
                top10Scores[k] = top10Scores[k - 1];
                top10Ids[k] = top10Ids[k - 1];
            }
            // Insert the new champion
            top10Scores[insertIdx] = score;
            top10Ids[insertIdx] = i;
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
