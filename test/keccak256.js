import {keccak} from '../src/keccak.js';
import keccak256 from '../src/keccak256.js';
import {random_bytes} from '../src/utils.js';
import {test} from 'node:test';
import assert from 'node:assert';

test('keccak256', () => {
	for (let i = 0; i < 10_000; i++) {
		let v = random_bytes(1000);
		assert.deepEqual(keccak(256).update(v).bytes, keccak256(v));
	}
})
