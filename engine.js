let h_newton = 550.0;
let v_newton = 0.0; 

let posBits = 550n; 
let velBits = 0n;
const gravityBits = 1n;

function runExperiment() {
    const red = document.getElementById('apple-red');
    const ghost = document.getElementById('apple-ghost');
    const debug = document.getElementById('bits');

    h_newton = 550.0;
    v_newton = 0.0;
    posBits = 550n;
    velBits = 0n;
    ghost.style.background = "rgba(0, 255, 65, 0.4)";

    function step() {
        // Newton
        v_newton += 1.0;          
        h_newton -= v_newton;     
        if (h_newton <= 0) h_newton = 0; 
        red.style.top = (600 - h_newton) + "px";

        // NP Inference
        velBits = velBits + gravityBits; 
        
        if (velBits >= posBits) posBits = 0n; 
        else posBits = posBits - velBits; 
        
        let Nc = BigInt(Math.floor(Math.random() * 5)); 
        let truthString = (posBits === 0n) ? 0n : (posBits ^ Nc); 

        let visualY = 600 - Number(truthString);
        ghost.style.top = visualY + "px";
        debug.innerText = `Truth: 0x${truthString.toString(16).toUpperCase()}`;

        if (posBits > 0n || h_newton > 0) {
            requestAnimationFrame(step);
        } else {
            ghost.style.background = "#ffff00";
            console.log("Inference and Calculus Resolved at 0.");
        }
    }
    step();
}
