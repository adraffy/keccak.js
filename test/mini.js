import {keccak} from '../src/keccak.js';
import mini from '../src/mini.js';
import {random_bytes, compare_arrays} from '../src/utils.js';

for (let i = 0; i < 10000; i++) {
	let v = random_bytes(1000);
	if (compare_arrays(keccak(256).update(v).bytes, mini(v))) {
		throw new Error('wtf');
	}
}

console.log('OK');