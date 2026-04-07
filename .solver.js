// solver.js - The NP Inference Engine

function solveLatticeTarget(startBits, targetBits, maxCycles) {
    // The "Beam" of possibilities. We start with one reality.
    let beam = [{ pos: startBits, vel: 0n, path: [] }];
    
    for (let cycle = 0; cycle < maxCycles; cycle++) {
        let nextBeam = [];
        
        for (let state of beam) {
            // Calculate Newtonian baseline (bitwise)
            let velNext = state.vel + 1n; // Add gravity
            let posNext = state.pos - velNext; // Fall
            
            // NP BRANCHING: The universe splits.
            // Option 0: Nc = 0 (Smooth fall)
            // Option 1: Nc = 1 (Quantum jitter)
            
            for (let nc = 0n; nc <= 1n; nc++) {
                let truthString = posNext ^ nc;
                
                nextBeam.push({
                    pos: truthString,
                    vel: velNext,
                    path: [...state.path, nc] // Record the 'Choice'
                });
            }
        }
        
        // PRUNING (The Fitness Function)
        // Keep only the 100 strings closest to the Target (Hamming/Absolute distance)
        nextBeam.sort((a, b) => Number(absDiff(a.pos, targetBits) - absDiff(b.pos, targetBits)));
        beam = nextBeam.slice(0, 100); 
        
        // Did we find the exact Truth String?
        if (beam[0].pos === targetBits) {
            return beam[0].path; // NP Problem Solved! Return the exact sequence.
        }
    }
    return null; // Failed to solve within cycle limit
}

function absDiff(a, b) {
    return a > b ? a - b : b - a;
}
