import {keccak} from '../keccak.js';

// https://github.com/phusion/node-sha3
import {Keccak as sha3_Keccak} from 'sha3';

// https://www.npmjs.com/package/js-sha3
import js_sha3 from 'js-sha3';
const js_sha3_keccak256 = js_sha3.keccak256;

export function compare_array(a, b) {
	let {length: n} = a;
	let c = n - b.length;
	for (let i = 0; c == 0 && i < n; i++) c = a[i] - b[i];
	return c;
}

export function random_bytes(n) {	
	let v = new Uint8Array(n);
	for (let i = 0; i < n; i++) {
		v[i] = (Math.random() * 256)|0; 
	}
	return v;
}

export function random_chunks(v) {
	if (typeof v === 'number') v = random_bytes(v);
	let chunks = [];
	while (v.length > 0) {
		let cut = 1 + (Math.random() * (v.length - 1)) | 0;
		chunks.push(v.slice(0, cut)); // copy
		v = v.subarray(cut);
	}
	return chunks;
}

export const HASHERS = [
	{
		name: 'js_sha3',   
		make() {
			let h = js_sha3_keccak256.create();
			return {
				update(v) { h.update(v); },
				bytes() { return new Uint8Array(h.arrayBuffer()); }
			};
		}
	},
	{
		name: 'sha3',
		make() {
			let h = new sha3_Keccak(256);
			return {
				update(v) { h.update(Buffer.from(v)); },
				bytes() { 					
					let buffer = Buffer.alloc(32);
					h.digest({buffer});
					return buffer;
				}
			};
		}
	},
	{
		name: 'adraffy',
		make() {
			let h = keccak();
			return {
				update(v) { h.update(v); },
				bytes() { return h.bytes; }
			};
		}
	}
].sort(() => Math.random() < 0.5);