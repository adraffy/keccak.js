import {IMPLS} from './impls.js';
import {random_bytes, random_chunks, hex_from_bytes} from '../src/utils.js';
import {test} from 'node:test';
import assert from 'node:assert';

test('random chunks', async T => {
	let m = [
		[10, 100000],
		[100, 10000],
		[1000, 1000],
		[10000, 100],
	];
	for (let [N, L] of m) {
		await T.test(`${N}x[0,${L}) bytes`, () => {
			for (let i = 0; i < N; i++) { 
				check_chunks(random_chunks((Math.random() * L) | 0));		
			}
		});
	}

	let n = 1000;
	await T.test(`[0,${n}-lengths`, () => {
		let v = random_bytes(1000);
		for (let i = 0; i <= v.length; i++) {
			check_chunks([v.subarray(0, i)]);
		}
	});
});

function hash_for_chunks(h, chunks) {
	for (let v of chunks) h.update(v);
	return hex_from_bytes(h.bytes());
}

function check_chunks(chunks) {
	let h0 = hash_for_chunks(IMPLS[0].make(), chunks);
	for (let i = 1; i < IMPLS.length; i++) {
		assert.equal(hash_for_chunks(IMPLS[i].make(), chunks), h0);
	}	
}
