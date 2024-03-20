import {utf8_from_bytes, hex_from_bytes} from '../src/utils.js';

console.log(hex_from_bytes('abc'));
console.log(utf8_from_bytes('0x61'));

import keccak256 from '../dist/keccak256.min.js';

console.log(hex_from_bytes(keccak256(new Uint8Array([1,2,3]))));
