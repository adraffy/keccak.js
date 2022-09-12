import {keccak, sha3, shake} from '../src/keccak.js';

console.log('[Example]');

let h = keccak(); // default: 256-bit

h.update([1,2]);              // arrays of bytes
h.update(Uint8Array.of(3,4)); // byte arrays
h.update(new ArrayBuffer(2)); // array buffers
h.update('A');                // utf8 strings
h.update_hex('0x123');        // hex strings

console.log(h.bytes); // Uint8Array
console.log(h.hex);   // hex string

// chainable
console.log(sha3().update('A').hex);

let s = shake(128); 
s.bytes();   // first 32-bytes (default: derived from bits)
s.bytes(11); //  next 11-bytes
s.hex(13);   //  next 13-bytes as hex string

console.log('[Helpers]');

import {bytes_from_hex, hex_from_bytes} from '../src/utils.js';

console.log(bytes_from_hex('0x01'));
console.log(bytes_from_hex('01'));
console.log(hex_from_bytes([1,2,3,4]));

import {bytes_from_utf8, utf8_from_bytes} from '../src/utils.js';

console.log(bytes_from_utf8('abc'));
console.log(utf8_from_bytes([240, 159, 146, 169]));
