#include <stdint.h>

/**
 * THE BIT-TRANSLATOR
 * Adds two bitstrings using only XOR and AND.
 * This is the "Assembly of Reality" where 1 is above 0.
 */
uint64_t bitwise_add(uint64_t a, uint64_t b) {
    while (b != 0) {
        uint64_t sum = a ^ b;             // Sum without carries
        uint64_t carry = (a & b) << 1;    // The Energy pushing to next bit
        a = sum;
        b = carry;
    }
    return a;
}

/**
 * THE NEWTONIAN KERNEL (Translated to Bit-Manipulation)
 */
uint64_t compute_step(uint64_t pos, uint64_t vel, uint64_t g, uint64_t nc) {
    // 1. vel = vel + g
    uint64_t next_vel = bitwise_add(vel, g);
    
    // 2. pos = pos - vel (Two's Complement Subtraction for falling)
    uint64_t neg_vel = bitwise_add(~next_vel, 1);
    uint64_t next_pos = bitwise_add(pos, neg_vel);

    // 3. Apply Computational Noise (Dynamic Parameter)
    return next_pos ^ nc;
}
