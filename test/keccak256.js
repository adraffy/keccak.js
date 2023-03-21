import {keccak} from '../src/keccak.js';
import keccak256 from '../src/keccak256.js';
import {random_bytes, compare_arrays} from '../src/utils.js';

for (let i = 0; i < 10_000; i++) {
	let v = random_bytes(1000);
	if (compare_arrays(keccak(256).update(v).bytes, keccak256(v))) {
		throw new Error('wtf');
	}
}

console.log('PASS keccak256');
