# keccak.js
1-file, 0-dependancy ES6 Keccak because bloat and dependencies are bullshit.

<a href="https://raffy.antistupid.com/eth/keccak.html">Demo</a>

```JavaScript
import {KeccakHasher} from '@antistupid/keccak';
// browser:
// import {KeccakHasher} 'from https://unpkg.com/@antistupid/keccak@latest/keccak.js';

// create a reusable hasher:
let h = KeccakHasher.unpadded(); // default, 256-bit
//      KeccakHasher.sha3(384)

// add some data:
h.update('A'); // strings
h.update('B').update('C'); // chainable
h.update([1,2]); // arrays
h.update(Uint8Array.from([3,4])); // typed-arrays
h.update(5); // single byte
h.finalize(); // also-chainable
// h is ready again for input

// access hash:
h.output // Uint8Array (this is reused, .slice() if needed)
h.hex // hex-string (not 0x-prefixed)

// one-liner:
KeccakHasher.unpadded().update('A').finalize().hex
```

Using **Rounded Constant LFSR** from [brix/crypto-js](https://github.com/brix/crypto-js/blob/develop/src/sha3.js) and **32-bit Permute** from [emn178/js-sha](https://github.com/emn178/js-sha3).

