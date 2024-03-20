import {keccak, sha3, shake} from '../src/keccak.js';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert';

// test('nist', () => {
// 	// why are the NIST samples PDF?!?
// 	// https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/sha3/sha3vs.pdf
// 	// https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/documents/examples/sha_all.pdf
// 	// TODO: parse these 
// })

test('wikipedia', () => {
	// examples from wikpedia
	// https://en.wikipedia.org/wiki/SHA-3#Examples_of_SHA-3_variants
	test_file(new URL('./data/wikipedia.json', import.meta.url));
});

test('mathematica', () => {
	// generated samples from Mathematica v12.1
	test_file(new URL('./data/mathematica.json', import.meta.url));
});

function test_file(path) {
	test_list(JSON.parse(readFileSync(path)));
}

function test_list(tests) {
	let last_input;
	for (let test of tests) {
		let hash;
		try {
			let {input, base64} = test;
			if (input !== undefined) {
				last_input = input;
				if (Object.keys(test).length == 1) continue;
			} else if (typeof base64 === 'string') {
				last_input = Buffer.from(base64, 'base64');
				if (Object.keys(test).length == 1) continue;
			}
			if (last_input === undefined) throw new Error('no input');
			let {algo, bits, n} = test;
			switch (algo?.toLowerCase()) {
				case 'keccak': hash = keccak(bits).update(last_input).hex; break;
				case 'sha3':   hash = sha3(bits).update(last_input).hex; break;
				case 'shake':  hash = shake(bits).update(last_input).hex(n); break;
				default: throw new Error(`unknown algo`);
			}	
		} catch (cause) {			
			throw new Error('bad test', {cause});
		}
		assert.equal(hash, test.hash);
	}
}
