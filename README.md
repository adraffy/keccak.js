# keccak.js
0-dependancy ES6 Keccak that works in the browser.

* **11% faster** than [`js-sha3`](https://www.npmjs.com/package/js-sha3) (also 2-3x smaller)
* [`6KB` **Default**](./dist/index.min.js) — full library
* [`4KB`](./dist/keccak256.min.js) — only [`256-bit Keccak`](./src/keccak256.js) for `Uint8Array` &rarr; `Uint8Array`

[**Demo**](https://adraffy.github.io/keccak.js/test/demo.html) ⭐

```JavaScript
import {keccak, sha3, shake} from '@adraffy/keccak';
// npm i @adraffy/keccak
// browser: https://cdn.jsdelivr.net/npm/@adraffy/keccak@latest/dist/index.min.js

// create a hasher:
let h = keccak(); // default: 256-bit

h.update(new Uint8Array([3,4]); // byte array
h.update(new ArrayBuffer(2));   // array buffer
h.update([1,2]);                // array of bytes
h.update('A');                  // strings (utf8)
h.update_hex('0x123');          // hex-strings

// get hash 
console.log(h.bytes); // Uint8Array
console.log(h.hex);   // hex-string

// chainable
sha3().update('A').hex;

// shake support:
let s = shake(128); 
s.bytes();   // first 32-bytes (default: derived from bits)
s.bytes(11); //  next 11-bytes
s.hex(13);   //  next 13-bytes as hex-string
```

## Helpers

### Hex
```JavaScript
import {bytes_from_hex, hex_from_bytes} from '@adraffy/keccak';

// hex-string -> Uint8Array
bytes_from_hex('0x01'); // UintArray(1)[1]
bytes_from_hex('0x1'); // can be ragged
bytes_from_hex('01'); // "0x" is optional
bytes_from_hex('1');
bytes_from_hex(''); // UintArray(0)[]

// Uint8ArrayLike|string -> hex-string
// note: no "0x" prefix
hex_from_bytes([1,2,3,4]); // "01020304"
```

### UTF8
```Javascript
import {bytes_from_utf8, utf8_from_bytes} from '@adraffy/keccak';

// string -> Uint8Array
bytes_from_utf8('abc'); // UintArray(3)[97, 98, 99]
bytes_from_utf8(''); // UintArray(0)[]

// Uint8ArrayLike|hex-string -> string
// throws on invalid utf8
utf8_from_bytes([240, 159, 146, 169])); // "💩"
```

## Mini 256-bit Keccak
```Javascript
import keccak256 from '.../dist/keccak256.min.js';

// Uint8Array -> Uint8Array
keccak256(new Uint8Array([1,2,3])); // Uint8Array(32)[...]
```

## Acknowledgements

* [permute.js](./src/permute.js)
	* **Round Constant LFSR** from [XKCP](https://github.com/XKCP/XKCP/blob/master/lib/low/KeccakP-1600/ref-32bits/KeccakP-1600-reference32BI.c#L103)
	* **32-bit Permute** from [emn178/js-sha](https://github.com/emn178/js-sha3)
