# keccak.js
1-file, 0-dependancy ES6 Keccak.

<a href="https://raffy.antistupid.com/eth/keccak.html">Demo</a>

```JavaScript
import {KeccakHasher} from '@adraffy/keccak';
// browser:
// import {KeccakHasher} from 'https://unpkg.com/@adraffy/keccak@latest/keccak.js';

// create a reusable hasher:
let h = KeccakHasher.unpadded(); // default, 256-bit

// alternatives: (note: bits % 32 == 0)
// - KeccakHasher.unpadded(bits)   
// - KeccakHasher.sha3(bits)
// - KeccakHasher.shake(n_bits, bits) // (note: n_bits % 8 == 0)

// add some data:
h.update('A');                    // strings
h.update('B').update('C');        // chainable
h.update([1,2]);                  // arrays
h.update(Uint8Array.from([3,4])); // typed-arrays
h.update(5);                      // single byte
h.finalize();                     // chainable
// h is ready for new input

// access hash post finalize():
h.output // Uint8Array (note: this is reused, .slice() for a copy)
h.hex // hex-string (note: this is computed, not 0x-prefixed)

// one-liner:
KeccakHasher.unpadded().update('A').finalize().hex
```

Using **Rounded Constant LFSR** from [brix/crypto-js](https://github.com/brix/crypto-js/blob/develop/src/sha3.js) and **32-bit Permute** from [emn178/js-sha](https://github.com/emn178/js-sha3).