import {permute32} from './permute.js';
import {hex_from_bytes, bytes_from_hex, bytes_from_utf8, expect_byte_array, bytes_from_int32LE} from './utils.js';

// primary api
export function keccak(bits = 256) { return new Fixed(bits,        0b1); } // [1]0*1
export function sha3(bits = 256)   { return new Fixed(bits,      0b110); } // [011]0*1
export function shake(bits)        { return new Extended(bits, 0b11111); } // [11111]0*1

class KeccakHasher {
	constructor(capacity_bits, suffix) {
		const C = 1600;
		if (capacity_bits & 0x1F) throw new Error('capacity % 32 != 0');
		if (capacity_bits < 0 || capacity_bits >= C) throw new Error(`capacity must be [0,${C})`);
		this.block_count = (C - capacity_bits) >> 5;
		this.block_index = 0; // current block index
		this.suffix = suffix; // padding byte
		this.ragged_block = 0; // ragged block bytes
		this.ragged_shift = 0; // ragged block width
		let v = this.sponge = []; // Array(50).fill(0) taints all jit
		for (let i = 0; i < 50; i++) v[i] = 0;
	}
	// update the hasher
	// throws on bad input
	update_hex(s) { return this.update(bytes_from_hex(s)); }
	update(v) {
		v = expect_byte_array(v, bytes_from_utf8);
		let off = 0;
		let len = v.length;
		if (this.ragged_shift > 0) { // make aligned
			off = this._add_ragged(v, 0);
			if (off == len) return this; // chainable
		}
		let {sponge, block_index, block_count} = this;
		while (true) {
			let end = Math.min(block_count, block_index + ((len - off) >> 2));
			while (block_index < end) {
				sponge[block_index++] ^= v[off++] | (v[off++] << 8) | (v[off++] << 16) | (v[off++] << 24);
			}
			if (end < block_count) break;
			permute32(sponge);
			block_index = 0;
		}
		this.block_index = block_index;
		if (off < len) this._add_ragged(v, off); // store remainder [1-3 bytes]
		return this; // chainable
	}
	// adds [0,4]-bytes, returns quantity
	_add_ragged(v, off) {
		let {ragged_shift, ragged_block} = this;
		let added = 0;
		for (; off < v.length && ragged_shift < 32; added++, off++, ragged_shift += 8) {
			ragged_block |= v[off] << ragged_shift;
		}
		if (ragged_shift == 32) {
			this._add_block(ragged_block);
			ragged_shift = 0;
			ragged_block = 0;
		} 
		this.ragged_block = ragged_block;
		this.ragged_shift = ragged_shift;
		return added; 
	}
	// digest a little-endian 32-bit word
	// warning: unsafe if ragged_shift > 0
	_add_block(x) {
		let {sponge, block_index, block_count} = this;
		sponge[block_index++] ^= x;
		if (block_index == block_count) {
			permute32(sponge);
			block_index = 0;
		}
		this.block_index = block_index;
	}	
	// idempotent
	// called automatically by subclasses
	finalize() {
		let {sponge, suffix, ragged_shift, block_index, block_count} = this;
		if (ragged_shift) {
			if (ragged_shift == -1) return; // already finalized
			suffix = this.ragged_block | (suffix << ragged_shift);
		}
		sponge[block_index] ^= suffix;
		sponge[block_count - 1] ^= 0x80000000;
		permute32(sponge);
		this.ragged_shift = -1; // mark as finalized
	}
}

export class Extended extends KeccakHasher {
	constructor(bits, padding) {
		super(bits << 1, padding);
		this.size0 = bits >> 2; // default output size
		this.byte_offset = 0; // byte-offset of output
	}
	hex(size) { return hex_from_bytes(this.bytes(size)); }
	bytes(size) {
		this.finalize();
		if (!size) size = this.size0;
		let {sponge, byte_offset, block_count} = this;
		let trim = (byte_offset & 3);
		let blocks = (trim > 0) + ((size + 3) >> 2);
		let block_index = (byte_offset >> 2) % block_count;
		let output = []; //new Int32Array(blocks);
		for (let i = 0; i < blocks; i++) {
			output.push(sponge[block_index++]);
			if (block_index == block_count) {
				permute32(sponge);
				block_index = 0;
			}
		}
		this.byte_offset = byte_offset + size;
		return bytes_from_int32LE(output).slice(trim, trim + size);
	}
}

export class Fixed extends KeccakHasher {
	constructor(bits, padding) {
		super(bits << 1, padding);
		this.size = bits >> 5;
	}
	get hex() { return hex_from_bytes(this.bytes); }
 	get bytes() {
		this.finalize();
		return bytes_from_int32LE(this.sponge.slice(0, this.size));
	}
}
