import {HASHERS, random_bytes, random_chunks} from './lineup.js';

function hash_for_chunks(h, chunks) {
	for (let v of chunks) h.update(v);
	return [...h.bytes()].map(x => x.toString(16).padStart(2, '0')).join('');
}

function check_chunks(chunks) {
	let h0 = hash_for_chunks(HASHERS[0].make(), chunks);
	for (let i = 1; i < HASHERS.length; i++) {
		if (h0 != hash_for_chunks(HASHERS[i].make(), chunks)) {
			throw new Error('wtf!');
		}
	}	
}

function try_random_chunks(N, L) {
	for (let i = 0; i < N; i++) { 
		check_chunks(random_chunks((Math.random() * L) | 0));		
	}
	console.log(`Pass: ${N}x[0,${L}) bytes`);
}

try {
	try_random_chunks(10, 100000);
	try_random_chunks(100, 10000);
	try_random_chunks(1000, 1000);
	try_random_chunks(10000, 100);

	let v = random_bytes(1000);
	for (let i = 0; i <= v.length; i++) {
		check_chunks([v.subarray(0, i)]);
	}
	console.log(`Pass: [0,${v.length}]-lengths`);

} catch (err) {
	console.error(err);
	process.exit(1);
}

console.log('OK');