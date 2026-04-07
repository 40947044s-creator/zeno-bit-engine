// ISO Standard "Bedrock" (Ground Level)
const BEDROCK = 0n; 
// ISO Standard "Apple" bit-representation (using a BigInt as a 64-bit stack)
let appleBits = 0x4059000000000000n; 
let newtonY = 50; // Visual starting point

function startRace() {
    const newtonApple = document.getElementById('apple-newton');
    const npApple = document.getElementById('apple-np');
    const npStats = document.getElementById('stats-np');

    function frame() {
        // --- 1. Newton Operator (Classical) ---
        if (newtonY < 450) {
            newtonY += 2.5; // Stolen gravity constant
            newtonApple.style.top = newtonY + "px";
        }

        // --- 2. NP Inference (Lower Layer) ---
        // The "Quicker Formula": Shift Right toward LSB + Computational Noise
        let Nc = BigInt(Math.floor(Math.random() * 0xFFFFFF)); // Dynamic Noise
        
        // Logical "Fall": bit-shifting the stack
        appleBits = (appleBits >> 1n) ^ Nc;

        // Visualizing the "Truth String"
        let visualPos = Number(appleBits % 400n) + 50; 
        npApple.style.top = visualPos + "px";
        npStats.innerText = "Truth String: 0x" + appleBits.toString(16).toUpperCase();

        if (newtonY < 450) {
            requestAnimationFrame(frame);
        } else {
            console.log("Impact Resolved at 159 UTC.");
        }
    }
    frame();
}
