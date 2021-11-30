import {compare_array, random_bytes} from './lineup.js';
import {bytes_from_hex, hex_from_bytes, bytes_from_utf8, utf8_from_bytes} from '../keccak.js';
import {readFileSync} from 'fs';

function local_file(name) {
	return new URL(name, import.meta.url).pathname;
}

function rng(n) {
	return (Math.random() * n) | 0;
}

for (let i = 0; i < 1000; i++) {
	let v0 = random_bytes(rng(10000));
	let s0 = hex_from_bytes(v0);
	let v1 = bytes_from_hex(s0);	
	let s1 = hex_from_bytes(v1)
	if (compare_array(v0, v1) != 0) throw new Error('wtf hex');
	if (s0 !== s1) throw new Error('wtf hex 2');
}

for (let s0 of readFileSync(local_file('random-utf8.txt'), {encoding: 'utf8'}).split('\n')) {
	let v0 = bytes_from_utf8(s0);
	let s1 = utf8_from_bytes(v0);
	let v1 = bytes_from_utf8(s1);
	if (compare_array(v0, v1) != 0) throw new Error('wtf utf8');
	if (s0 !== s1) throw new Error('wtf utf8 2');
}

console.log('OK');