import {keccak, sha3, shake} from '../keccak.js';

console.log('[Example]');

let h = keccak(); // default: 256-bit

h.update([1,2]);              // arrays of bytes
h.update(Uint8Array.of(3,4)); // byte arrays
h.update(new ArrayBuffer(2)); // array buffers
h.update('A');                // strings

console.log(h.bytes); // Uint8Array
console.log(h.hex);   // hex string

// chainable
console.log(sha3().update('A').hex);

let s = shake(128); 
s.bytes();   // first 32-bytes (default: derived from bits)
s.bytes(11); //  next 11-bytes
s.hex(13);   //  next 13-bytes as hex string

console.log('[Helpers]');

import {bytes_from_hex, bytes_from_str} from '../keccak.js'

console.log(bytes_from_hex('0x01'));
console.log(bytes_from_hex('01'));
console.log(bytes_from_str('abc'));