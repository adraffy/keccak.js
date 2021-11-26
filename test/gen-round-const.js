// https://github.com/brix/crypto-js/blob/develop/src/sha3.js

let v = [];

for (let LFSR = 1, i = 0; i < 48; i += 2) {
	let lower = 0, upper = 0;
	for (let j = 0; j < 7; j++) {
		if (LFSR & 1) {
			let shift = (1 << j) - 1;
			if (shift < 32) {
				lower ^= 1 << shift;
			} else {
				upper ^= 1 << (shift - 32);
			}
		}
		LFSR = (LFSR & 0x80) ? (LFSR << 1) ^ 0x71 : (LFSR << 1);
	}
    v.push(lower, upper);
}

console.log('[' + v.join(',') + ']');