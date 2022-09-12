// only keccak 256
import {permute32} from './permute.js';
import {bytes_from_int32LE} from './utils.js';
export default function(v) {
	if (!(v instanceof Uint8Array)) throw new TypeError('expected Uint8Array');
	const block_count = 34;
	let sponge = [];
	for (let i = 0; i < 50; i++) sponge[i] = 0;
	let off = 0;
	let len = v.length;
	let blocks = len >> 2;
	let block_index;
	while (true) {
		block_index = 0;
		let end = Math.min(block_count, blocks);
		while (block_index < end) {
			sponge[block_index++] ^= v[off++] | (v[off++] << 8) | (v[off++] << 16) | (v[off++] << 24);
		}
		if (end < block_count) break;
		permute32(sponge);
		blocks -= block_count;
	}
	let suffix = 1;
	while (off < len) {
		suffix = (suffix << 8) | v[--len];
	}
	sponge[block_index] ^= suffix;
	sponge[block_count-1] ^= 0x80000000;
	permute32(sponge);
	return bytes_from_int32LE(sponge.slice(0, 8));
}