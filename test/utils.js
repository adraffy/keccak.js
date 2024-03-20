import {
	random_bytes, 
	bytes_from_hex, hex_from_bytes, 
	bytes_from_utf8, utf8_from_bytes
} from '../src/utils.js';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert';

function rng(n) {
	return Math.floor(Math.random() * n);
}

test('hex int', () => {
	for (let i = 0, v = new Uint8Array(4), view = new DataView(v.buffer); i < 1000000; i++) {
		let x = rng(0xFFFFFFFF);
		view.setInt32(0, x, false);
		assert.equal(x, parseInt(hex_from_bytes(v), 16));
	}
});

test('hex bytes', () => {
	for (let i = 0; i < 1000; i++) {
		let v0 = random_bytes(rng(10000));
		let s0 = hex_from_bytes(v0);
		let v1 = bytes_from_hex(s0);	
		assert.deepEqual(v0, v1, s0);	
		let s1 = hex_from_bytes(v1);
		assert.equal(s0, s1);
	}
});

test('utf8 random', () => {
	for (let s0 of readFileSync(new URL('./data/random-utf8.txt', import.meta.url), {encoding: 'utf8'}).split('\n')) {
		let v0 = bytes_from_utf8(s0);
		let s1 = utf8_from_bytes(v0);
		let v1 = bytes_from_utf8(s1);
		assert.deepEqual(v0, v1);
		assert.equal(s0, s1);
	}
});

test('utf8 codepoints', () => {
	let td = new TextDecoder(); //{ignoreBOM: false});
	for (let cp = 0; cp <= 0x10FFFF; cp++) {
		let ch = String.fromCodePoint(cp);
		let v = bytes_from_utf8(ch);
		if (cp >= 0xD800 && cp <= 0xDFFF) continue;
		if (cp == 0xFEFF) continue;
		assert.equal(td.decode(v), ch, cp);
	}
});
