# keccak.js
0-dependancy ES6 Keccak that works in the browser.

[Demo](https://adraffy.github.io/adraffy/keccak.js/test/demo.html)

```JavaScript
import {keccak, sha3, shake} from '@adraffy/keccak';
// browser: 
// https://unpkg.com/@adraffy/keccak@latest/dist/keccak.min.js

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

## Helpers

```JavaScript
import {bytes_from_hex, hex_from_bytes} from '@adraffy/keccak';

console.log(bytes_from_hex('0x01'));
console.log(bytes_from_hex('01')); // 0x is optional
// UintArray(1)[1]
console.log(hex_from_bytes([1,2,3,4])); // no prefix
// "01020304"

import {bytes_from_utf8, utf8_from_bytes} from '@adraffy/keccak';

console.log(bytes_from_utf8('abc')); 
// UintArray(3)[97, 98, 99]
console.log(utf8_from_bytes([240, 159, 146, 169])); // throws on invalid utf8
// "💩"
```