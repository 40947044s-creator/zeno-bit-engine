// Initial States (ISO Standard Table Lookups)
let h_newton = 550;
let posBits = 0x0000000000000200n; // Height in Bit-Stack
let velBits = 0n;
const gravity = 1n;

function runExperiment() {
    const red = document.getElementById('apple-red');
    const ghost = document.getElementById('apple-ghost');
    const debug = document.getElementById('bits');

    function step() {
        // --- PANEL 1: NEWTON (The Control) ---
        if (h_newton > 30) {
            h_newton -= 5; // Simplified Gravity
            red.style.top = (600 - h_newton) + "px";
        }

        // --- PANEL 2: NP INFERENCE (The Engine) ---
        // Simulating the kernel.c logic in JS for static hosting
        velBits = velBits + gravity; 
        let Nc = BigInt(Math.floor(Math.random() * 4)); // Dynamic Noise
        posBits = posBits - velBits;
        let truthString = posBits ^ Nc;

        // Visualize the "Hidden Secret"
        let visualY = 600 - Number(truthString);
        ghost.style.top = visualY + "px";
        debug.innerText = `Truth: 0x${truthString.toString(16).toUpperCase()}`;

        // TERMINATION: Both stop when the Bitstring hits Bedrock
        if (truthString > 0n && visualY < 570) {
            requestAnimationFrame(step);
        } else {
            ghost.style.background = "yellow";
            console.log("Inference Resolved at Bedrock.");
        }
    }
    step();
}
