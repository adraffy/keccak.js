# keccak.js
1-file, 0-dependancy ES6 Keccak that works in the browser.

<a href="https://raffy.antistupid.com/eth/keccak.html">Demo</a>

```JavaScript
import {keccak, sha3, shake} from '@adraffy/keccak';
// browser:
// import {KeccakHasher} from 'https://unpkg.com/@adraffy/keccak@latest/keccak.js';

// create a hasher:
let h = keccak(); // default: 256-bit

h.update(Uint8Array.of(3,4)); // byte arrays
h.update(new ArrayBuffer(2)); // array buffers
h.update([1,2]);              // array of bytes
h.update('A');                // strings

// get hash 
console.log(h.bytes); // Uint8Array
console.log(h.hex);   // hex string

// chainable
console.log(sha3().update('A').hex);

// shake support:
let s = shake(128); 
s.bytes();   // first 32-bytes (default: derived from bits)
s.bytes(11); //  next 11-bytes
s.hex(13);   //  next 13-bytes as hex string
```
Uses **Round Constant LFSR** from [XKCP](https://github.com/XKCP/XKCP/blob/master/lib/low/KeccakP-1600/ref-32bits/KeccakP-1600-reference32BI.c#L103) and **32-bit Permute** from [emn178/js-sha](https://github.com/emn178/js-sha3).