import {shake} from '../src/keccak.js';

let h = shake(128);

for (let i = 0; i < 32; i++) {
	console.log(h.hex());
}
