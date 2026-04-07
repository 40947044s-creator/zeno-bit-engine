// ISO Standard Initial States
let h_newton = 550;
let posBits = 0x0000000000000200n; // Height in Bit-Stack (approx 512)
let velBits = 0n;
const gravity = 1n;

function runExperiment() {
    const red = document.getElementById('apple-red');
    const ghost = document.getElementById('apple-ghost');
    const debug = document.getElementById('bits');

    // Reset positions for multiple runs
    h_newton = 550;
    posBits = 0x0000000000000200n;
    velBits = 0n;
    ghost.style.background = "rgba(0, 255, 65, 0.4)"; // Reset ghost color

    function step() {
        // --- PANEL 1: NEWTON (The Continuous Control) ---
        if (h_newton > 30) {
            h_newton -= 4.5; // Simplified continuous float gravity
            red.style.top = (600 - h_newton) + "px";
        }

        // --- PANEL 2: NP INFERENCE (The Discrete Engine) ---
        velBits = velBits + gravity; // Accumulate velocity
        
        let Nc = BigInt(Math.floor(Math.random() * 5)); // Dynamic Computational Noise
        
        posBits = posBits - velBits; // Discrete step toward bedrock
        
        let truthString = posBits ^ Nc; // The XOR Interference

        // Visualize the "Hidden Secret"
        let visualY = 600 - Number(truthString);
        ghost.style.top = visualY + "px";
        debug.innerText = `Truth: 0x${truthString.toString(16).toUpperCase()}`;

        // TERMINATION: Stop when the Bitstring hits Bedrock (0)
        if (truthString > 0n && visualY < 570) {
            requestAnimationFrame(step);
        } else {
            ghost.style.background = "#ffff00"; // Highlight on impact
            console.log("Inference Resolved at Bedrock (Zeno Limit Reached).");
        }
    }
    step();
}
