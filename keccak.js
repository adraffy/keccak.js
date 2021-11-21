export function bytes_from_input(x) {
	if (x instanceof Uint8Array) {
		return x; 
	} else if (Array.isArray(x)) {
		return Uint8Array.from(x);
	} else if (ArrayBuffer.isView(x)) {
		return new Uint8Array(x.buffer, x.byteOffset, x.byteLength);
	} else if (typeof x === 'string') {
		let {length} = x;
		let v = new Uint8Array(length);
		for (let i = 0; i < length; i++) {
			v[i] = x.charCodeAt(i);
		}
		return v;
	} else if (typeof x === 'number') { // allow byte?
		return Uint8Array.from([x & 0xFF]); 
	} else {
		throw new TypeError('unknown conversion to bytes');
	}
}

export class KeccakHasher {
	// https://en.wikipedia.org/wiki/SHA-3#Instances
	static unpadded(bits = 256) { return new this(bits << 1, bits, 1); } // [1]0*1
	static sha3(bits = 256) { return new this(bits << 1, bits, 6); } // [011]0*1
	constructor(capacity_bits, output_bits, suffix) {
		if ((capacity_bits | output_bits) & 0x1F) throw new Error('bits not divisible by 32');
		this.state = new Uint32Array(RC.length + 2);
		this.block = new Uint32Array((1600 - capacity_bits) >> 5);
		this.suffix = suffix; // padding 
		this.block_index = 0; // current block index
		this.ragged_block = 0; // ragged block bytes
		this.ragged_width = 0; // ragged block width
		this.output = new Uint8Array(output_bits >> 3);
	}
	_permute_state() {
		let {state, block} = this;
		for (let i = 0; i < block.length; i++) {
			state[i] ^= block[i];
		}
		permute(state);
		block.fill(0);
		this.block_index = 0;
	}
	_add_block(x) {
		this.block[this.block_index++] = x;
		if (this.block_index == this.block.length) {
			this._permute_state();
		}
	}
	_add_ragged(v) {
		let {ragged_width, ragged_block} = this;
		let added = Math.min(4 - ragged_width, v.length);
		for (let i = 0; i < added; i++) {
			ragged_block |= v[i] << (ragged_width++ << 3);
		}
		if (ragged_width === 4) {
			this._add_block(ragged_block);
			ragged_width = 0;
			ragged_block = 0;
		} 
		this.ragged_block = ragged_block;
		this.ragged_width = ragged_width;
		return added; // returns bytes used from v
	}
	update(input) {
		let v = bytes_from_input(input);
		if (v.length == 0) return this; 
		if (this.ragged_width > 0) { // complete ragged buffer first
			let n = this._add_ragged(v);
			if (n == v.length) return this;
			v = v.subarray(n);
		}
		const CHUNK_SIZE = this.block.length << 4;
		if (v.byteOffset & 0x3 && v.length >= CHUNK_SIZE) { 
			v = v.slice(); // align dedotated wam
		}
		let view = new DataView(v.buffer, v.byteOffset, v.byteLength);
		let off = 0;
		for (; this.block_index > 0 && off + 4 <= v.byteLength; off += 4) { // finish unused blocks 
			this._add_block(view.getUint32(off, true));
		}
		let {state} = this;
		while (off + CHUNK_SIZE < v.byteLength) { // process entire chunks
			for (let i = 0; i < this.block.length; i++, off += 4) {
				state[i] ^= view.getUint32(off, true);
			}
			permute(state);
		}
		for (; off + 4 <= v.byteLength; off += 4) { // put remainder in blocks
			this._add_block(view.getUint32(off, true));
		}
		if (off < v.byteLength) { // put remainder in ragged [1-3 bytes]
			this._add_ragged(v.subarray(off));
		}
		return this;
	}
	finalize() {
		let {output, state, block} = this;
		let view = new DataView(output.buffer, output.byteOffset, output.byteLength);
		view.setUint32(0, this.suffix, true);
		if (this.block_index == block.length - 1) { 
			output[3 - this.ragged_width] |= 0x80; 
			this._add_ragged(output); // this will _permute()
		} else {
			this._add_ragged(output);
			block[block.length - 1] |= 0x80000000;
			this._permute_state();
		}
		for (let off = 0, i = 0; off < output.length; off += 4) {
			view.setUint32(off, state[i++], true);
			if (i == state.length) {
				i = 0;
				permute(state);
			}
		}
		state.fill(0); // can be reused after finalize
		return this;
	}
	// use .output for bytes
	get hex() { return [...this.output].map(x => x.toString(16).padStart(2, '0')).join(''); }
	//get x() { return `0x${this.hex}`; }
	//get n() { return BigInt(this.x); }
}

// https://github.com/brix/crypto-js/blob/develop/src/sha3.js
const RC = new Uint32Array(48);
for (let LFSR = 1, i = 0; i < RC.length;) {
	let lower = 0, upper = 0;
	for (let j = 0; j < 7; j++) {
		if (LFSR & 1) {
			let shift = (1 << j) - 1;
			if (shift < 32) {
				lower ^= 1 << shift;
			} else {
				upper ^= 1 << (shift - 32);
			}
		}
		LFSR = (LFSR & 0x80) ? (LFSR << 1) ^ 0x71 : (LFSR << 1);
	}
	RC[i++] = lower;
	RC[i++] = upper;
}

// https://github.com/emn178/js-sha3/blob/master/src/sha3.js
function permute(s) {
	for (let n = 0; n < 48; n += 2) {
		let c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
		let c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
		let c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
		let c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
		let c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
		let c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
		let c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
		let c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
		let c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
		let c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

		let h = c8 ^ ((c2 << 1) | (c3 >>> 31));
		let l = c9 ^ ((c3 << 1) | (c2 >>> 31));
		s[0] ^= h;
		s[1] ^= l;
		s[10] ^= h;
		s[11] ^= l;
		s[20] ^= h;
		s[21] ^= l;
		s[30] ^= h;
		s[31] ^= l;
		s[40] ^= h;
		s[41] ^= l;
		h = c0 ^ ((c4 << 1) | (c5 >>> 31));
		l = c1 ^ ((c5 << 1) | (c4 >>> 31));
		s[2] ^= h;
		s[3] ^= l;
		s[12] ^= h;
		s[13] ^= l;
		s[22] ^= h;
		s[23] ^= l;
		s[32] ^= h;
		s[33] ^= l;
		s[42] ^= h;
		s[43] ^= l;
		h = c2 ^ ((c6 << 1) | (c7 >>> 31));
		l = c3 ^ ((c7 << 1) | (c6 >>> 31));
		s[4] ^= h;
		s[5] ^= l;
		s[14] ^= h;
		s[15] ^= l;
		s[24] ^= h;
		s[25] ^= l;
		s[34] ^= h;
		s[35] ^= l;
		s[44] ^= h;
		s[45] ^= l;
		h = c4 ^ ((c8 << 1) | (c9 >>> 31));
		l = c5 ^ ((c9 << 1) | (c8 >>> 31));
		s[6] ^= h;
		s[7] ^= l;
		s[16] ^= h;
		s[17] ^= l;
		s[26] ^= h;
		s[27] ^= l;
		s[36] ^= h;
		s[37] ^= l;
		s[46] ^= h;
		s[47] ^= l;
		h = c6 ^ ((c0 << 1) | (c1 >>> 31));
		l = c7 ^ ((c1 << 1) | (c0 >>> 31));
		s[8] ^= h;
		s[9] ^= l;
		s[18] ^= h;
		s[19] ^= l;
		s[28] ^= h;
		s[29] ^= l;
		s[38] ^= h;
		s[39] ^= l;
		s[48] ^= h;
		s[49] ^= l;

		let b00 = s[0];
		let b01 = s[1];
		let b32 = (s[11] << 4) | (s[10] >>> 28);
		let b33 = (s[10] << 4) | (s[11] >>> 28);
		let b14 = (s[20] << 3) | (s[21] >>> 29);
		let b15 = (s[21] << 3) | (s[20] >>> 29);
		let b46 = (s[31] << 9) | (s[30] >>> 23);
		let b47 = (s[30] << 9) | (s[31] >>> 23);
		let b28 = (s[40] << 18) | (s[41] >>> 14);
		let b29 = (s[41] << 18) | (s[40] >>> 14);
		let b20 = (s[2] << 1) | (s[3] >>> 31);
		let b21 = (s[3] << 1) | (s[2] >>> 31);
		let b02 = (s[13] << 12) | (s[12] >>> 20);
		let b03 = (s[12] << 12) | (s[13] >>> 20);
		let b34 = (s[22] << 10) | (s[23] >>> 22);
		let b35 = (s[23] << 10) | (s[22] >>> 22);
		let b16 = (s[33] << 13) | (s[32] >>> 19);
		let b17 = (s[32] << 13) | (s[33] >>> 19);
		let b48 = (s[42] << 2) | (s[43] >>> 30);
		let b49 = (s[43] << 2) | (s[42] >>> 30);
		let b40 = (s[5] << 30) | (s[4] >>> 2);
		let b41 = (s[4] << 30) | (s[5] >>> 2);
		let b22 = (s[14] << 6) | (s[15] >>> 26);
		let b23 = (s[15] << 6) | (s[14] >>> 26);
		let b04 = (s[25] << 11) | (s[24] >>> 21);
		let b05 = (s[24] << 11) | (s[25] >>> 21);
		let b36 = (s[34] << 15) | (s[35] >>> 17);
		let b37 = (s[35] << 15) | (s[34] >>> 17);
		let b18 = (s[45] << 29) | (s[44] >>> 3);
		let b19 = (s[44] << 29) | (s[45] >>> 3);
		let b10 = (s[6] << 28) | (s[7] >>> 4);
		let b11 = (s[7] << 28) | (s[6] >>> 4);
		let b42 = (s[17] << 23) | (s[16] >>> 9);
		let b43 = (s[16] << 23) | (s[17] >>> 9);
		let b24 = (s[26] << 25) | (s[27] >>> 7);
		let b25 = (s[27] << 25) | (s[26] >>> 7);
		let b06 = (s[36] << 21) | (s[37] >>> 11);
		let b07 = (s[37] << 21) | (s[36] >>> 11);
		let b38 = (s[47] << 24) | (s[46] >>> 8);
		let b39 = (s[46] << 24) | (s[47] >>> 8);
		let b30 = (s[8] << 27) | (s[9] >>> 5);
		let b31 = (s[9] << 27) | (s[8] >>> 5);
		let b12 = (s[18] << 20) | (s[19] >>> 12);
		let b13 = (s[19] << 20) | (s[18] >>> 12);
		let b44 = (s[29] << 7) | (s[28] >>> 25);
		let b45 = (s[28] << 7) | (s[29] >>> 25);
		let b26 = (s[38] << 8) | (s[39] >>> 24);
		let b27 = (s[39] << 8) | (s[38] >>> 24);
		let b08 = (s[48] << 14) | (s[49] >>> 18);
		let b09 = (s[49] << 14) | (s[48] >>> 18);

		s[0] = b00 ^ (~b02 & b04);
		s[1] = b01 ^ (~b03 & b05);
		s[10] = b10 ^ (~b12 & b14);
		s[11] = b11 ^ (~b13 & b15);
		s[20] = b20 ^ (~b22 & b24);
		s[21] = b21 ^ (~b23 & b25);
		s[30] = b30 ^ (~b32 & b34);
		s[31] = b31 ^ (~b33 & b35);
		s[40] = b40 ^ (~b42 & b44);
		s[41] = b41 ^ (~b43 & b45);
		s[2] = b02 ^ (~b04 & b06);
		s[3] = b03 ^ (~b05 & b07);
		s[12] = b12 ^ (~b14 & b16);
		s[13] = b13 ^ (~b15 & b17);
		s[22] = b22 ^ (~b24 & b26);
		s[23] = b23 ^ (~b25 & b27);
		s[32] = b32 ^ (~b34 & b36);
		s[33] = b33 ^ (~b35 & b37);
		s[42] = b42 ^ (~b44 & b46);
		s[43] = b43 ^ (~b45 & b47);
		s[4] = b04 ^ (~b06 & b08);
		s[5] = b05 ^ (~b07 & b09);
		s[14] = b14 ^ (~b16 & b18);
		s[15] = b15 ^ (~b17 & b19);
		s[24] = b24 ^ (~b26 & b28);
		s[25] = b25 ^ (~b27 & b29);
		s[34] = b34 ^ (~b36 & b38);
		s[35] = b35 ^ (~b37 & b39);
		s[44] = b44 ^ (~b46 & b48);
		s[45] = b45 ^ (~b47 & b49);
		s[6] = b06 ^ (~b08 & b00);
		s[7] = b07 ^ (~b09 & b01);
		s[16] = b16 ^ (~b18 & b10);
		s[17] = b17 ^ (~b19 & b11);
		s[26] = b26 ^ (~b28 & b20);
		s[27] = b27 ^ (~b29 & b21);
		s[36] = b36 ^ (~b38 & b30);
		s[37] = b37 ^ (~b39 & b31);
		s[46] = b46 ^ (~b48 & b40);
		s[47] = b47 ^ (~b49 & b41);
		s[8] = b08 ^ (~b00 & b02);
		s[9] = b09 ^ (~b01 & b03);
		s[18] = b18 ^ (~b10 & b12);
		s[19] = b19 ^ (~b11 & b13);
		s[28] = b28 ^ (~b20 & b22);
		s[29] = b29 ^ (~b21 & b23);
		s[38] = b38 ^ (~b30 & b32);
		s[39] = b39 ^ (~b31 & b33);
		s[48] = b48 ^ (~b40 & b42);
		s[49] = b49 ^ (~b41 & b43);

		s[0] ^= RC[n];
		s[1] ^= RC[n + 1];
	}
}