import {keccak, sha3, shake} from '../keccak.js';
import {readFileSync} from 'fs';

function local_file(name) {
	return new URL(name, import.meta.url).pathname;
}

function test_list(tests) {
	let last_input;
	for (let x of tests) {
		try {
			let {input, base64} = x;
			if (input !== undefined) {
				last_input = input;
				if (Object.keys(x).length == 1) continue;
			} else if (typeof base64 === 'string') {
				last_input = Buffer.from(base64, 'base64');
				if (Object.keys(x).length == 1) continue;
			}
			if (last_input === undefined) throw new Error('no input');
			let {algo, bits, n} = x;
			let hash;
			switch (algo?.toLowerCase()) {
				case 'keccak': hash = keccak(bits).update(last_input).hex; break;
				case 'sha3':   hash = sha3(bits).update(last_input).hex; break;
				case 'shake':  hash = shake(bits).update(last_input).hex(n); break;
				default: throw new Error(`unknown algo`);
			}	
			if (hash !== x.hash) {
				throw new Error(`different: ${hash}`);
			}
		} catch (err) {
			console.error(x);
			throw err;
		}
	}
}

function test_file(path) {
	test_list(JSON.parse(readFileSync(path)));
	console.log(`Pass: ${path}`);
}

try {
	// why are the NIST samples PDF?!?
	// https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/sha3/sha3vs.pdf
	// https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/documents/examples/sha_all.pdf
	// TODO: parse these 

	// examples from wikpedia
	// https://en.wikipedia.org/wiki/SHA-3#Examples_of_SHA-3_variants
	test_file(local_file('data-wiki.json'));

	// generated samples from Mathematica v12.1
	test_file(local_file('data-mathematica.json'));

} catch (err) {
	console.error(err);
	process.exit(1);
}

console.log('OK');
