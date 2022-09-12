import {
	compare_arrays, random_bytes, 
	bytes_from_hex, hex_from_bytes, 
	bytes_from_utf8, utf8_from_bytes
} from '../src/utils.js';
import {readFileSync} from 'node:fs';

function rng(n) {
	return Math.floor(Math.random() * n);
}

for (let i = 0, v = new Uint8Array(4), view = new DataView(v.buffer); i < 1000000; i++) {
	let x = rng(0xFFFFFFFF);
	view.setInt32(0, x, false);
	if (x !== parseInt(hex_from_bytes(v), 16)) throw new Error('wrong int');
}
console.log('PASS hex int');

for (let i = 0; i < 1000; i++) {
	let v0 = random_bytes(rng(10000));
	let s0 = hex_from_bytes(v0);
	let s1, v1;
	try {
		v1 = bytes_from_hex(s0);	
		s1 = hex_from_bytes(v1)
		if (compare_arrays(v0, v1) != 0) throw new Error('wrong bytes');
		if (s0 !== s1) throw new Error('wrong form');
	} catch (err) {
		console.log(err);
		console.log({s0, s1, v0, v1});
		process.exit(1);
	}
}
console.log('PASS hex bytes');

for (let s0 of readFileSync(new URL('./data/random-utf8.txt', import.meta.url), {encoding: 'utf8'}).split('\n')) {
	let v0, s1, v1;
	try {
		v0 = bytes_from_utf8(s0);
		s1 = utf8_from_bytes(v0);
		v1 = bytes_from_utf8(s1);
		if (compare_arrays(v0, v1) != 0) throw new Error('wrong bytes');
		if (s0 !== s1) throw new Error('wrong form');
	} catch (err) {
		console.log(err);
		console.log({s0, s1, v0, v1});
		process.exit(1);
	}
}
console.log('PASS utf8 random');

for (let cp = 0; cp <= 0x10FFFF; cp++) {
	let s, v;
	try {
		s = String.fromCodePoint(cp);
		v = bytes_from_utf8(s);
	} catch (err) {
		console.log(err);
		console.log({cp, s, v});
		process.exit(1);	
	}
}
console.log('PASS utf8 codepoints');

console.log('OK');