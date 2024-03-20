export function expect_byte_array(v, str_handler) {
	if (Array.isArray(v)) {
		if (v.every(x => Number.isSafeInteger(x) && x >= 0 && x <= 255)) return v;
	} else if (v instanceof Uint8Array) {
		return v;
	} else if (v instanceof ArrayBuffer) {
		return new Uint8Array(v);
	} else if (ArrayBuffer.isView(v)) {
		return new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
	} else if (str_handler && typeof v === 'string') {
		return str_handler(v);
	}
	throw new TypeError(`expected array of bytes`);
}

export function bytes_from_int32LE(u) {
	let n = u.length;
	let v = new Uint8Array(n << 2);
	let i = 0;
	for (let x of u) {
		v[i++] = x;
		v[i++] = x >> 8;
		v[i++] = x >> 16;
		v[i++] = x >> 24;
	}
	return v;
}

// returns no-prefix hex string from Uint8Array
export function hex_from_bytes(v) {
	v = expect_byte_array(v, bytes_from_utf8);
	let cps = [];
	for (let i = 0, n = v.length; i < n; i++) {
		let x = v[i];
		cps.push(hex_from_nibble(x >> 4), hex_from_nibble(x & 15));
	}
	return String.fromCharCode(...cps);
}
function hex_from_nibble(x) {
	return x < 10 ? 48 + x : 87 + x; // '0' or ('a' - 10)
}

// returns Uint8Array from hex-string
export function bytes_from_hex(s) {
	if (typeof s !== 'string') throw new TypeError('expected string');
	let pos = s.startsWith('0x') ? 2 : 0; // optional prefix
	let i = 0;
	let len = s.length;
	let v = new Uint8Array((len + 1 - pos) >> 1); // round up for odd
	if (len & 1) { // handle odd
		v[i++] = req_hex_digit(s, pos++);
	}
	while (pos < len) {
		v[i++] = (req_hex_digit(s, pos++) << 4) | req_hex_digit(s, pos++);
	}
	return v;
}
function req_hex_digit(s, i) {
	let c = s.charCodeAt(i);
	if (c <= 57) { // 0-9
		c -= 48; // '0'
	} else if (c <= 90) { // A-Z
		c -= 55; // 'A' + 10
	} else { // a-z
		c -= 87; // 'a' + 10
	}
	if (!(c >= 0 && c < 16)) throw new TypeError(`expected hex digit: ${s[i]}`);
	return c;
}

// returns string from bytes
export function utf8_from_bytes(v) {
	v = expect_byte_array(v, bytes_from_hex);
	let cps = [];
	for (let i = 0, n = v.length; i < n; ) {
		let x = v[i++];
		if (x < 0x80) {
			cps.push(x);
		} else if (x < 0xE0) {
			cps.push(((x & 0x1F) << 6) | req_utf8_cont(v, i++));
		} else if (x < 0xF0) {
			cps.push(((x & 0x0F) << 12) | (req_utf8_cont(v, i++) << 6) | req_utf8_cont(v, i++));
		} else {
			cps.push(((x & 0x07) << 18) | (req_utf8_cont(v, i++) << 12) | (req_utf8_cont(v, i++) << 6) | req_utf8_cont(v, i++));
		}
	}
	return String.fromCodePoint(...cps);
}
function req_utf8_cont(v, i) {
	let x = v[i];
	if ((x & 0xC0) != 0x80) throw new Error(`malformed utf8 at ${i}: expected continuation`);
	return x & 0x3F;
}

// returns Uint8Array from string
export function bytes_from_utf8(s) {
	if (typeof s !== 'string') throw new TypeError('expected string');
	let v = [];
	for (let pos = 0, len = s.length; pos < len; ) {
		let cp = s.codePointAt(pos++);
		if (cp < 0x800) {
			if (cp < 0x80) {
				v.push(cp);
			} else {
				v.push(0xC0 | (cp >> 6), 0x80 | (cp & 0x3F));
			}
		} else {
			if (cp < 0x10000) {
				v.push(0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
			} else {
				v.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
				pos++;
			}
		}
	}
	return Uint8Array.from(v);
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
	if (!ArrayBuffer.isView(v)) throw new TypeError('expected view');
	let chunks = [];
	while (v.length > 0) {
		let cut = 1 + (Math.random() * (v.length - 1))|0;
		chunks.push(v.slice(0, cut)); // copy
		v = v.subarray(cut);
	}
	return chunks;
}

