import {HASHERS, random_bytes, random_chunks} from './lineup.js';

function compare(inputs) {
	let n = Math.max(...HASHERS.map(x => x.name.length));
	HASHERS.map(x => {
		const t0 = performance.now();
		let hh = x.make();
		for (let chunks of inputs) {
			let h = x.make();
			for (let v of chunks) h.update(v);
			hh.update(h.bytes());
		}
		let sig = [...hh.bytes()].map(x => x.toString(16).padStart(2, '0')).join('');
		return {...x, t: performance.now() - t0, sig};
	}).sort((a, b) => a.t - b.t).forEach(({name, t, sig}) => {
		console.log(`${name.padStart(n)} | ${t.toFixed(0).padStart(7)} | ${sig}`);
	});
}

let inputs = Array(100);

console.log('[One Chunk]')
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = [random_bytes(Math.random() * 1000000 | 0)];
}
compare(inputs);

console.log('[Multi Chunk]')
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = random_chunks((Math.random() * 1000000) | 0);
}
compare(inputs);

console.log('[Block-aligned Chunk]');
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = [random_bytes(34 * 4 * (i + 1) * 100)];
}
compare(inputs);

console.log('[constructor]');
for (const x of HASHERS) {
	const t0 = performance.now();
	for (let i = 0; i < 1000000; i++) x.make();
	let t = performance.now() - t0;
	console.log({name: x.name, t});
}

console.log('[update]');
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = random_bytes(1234567);
}
for (const x of HASHERS) {
	let h = x.make();
	const t0 = performance.now();
	for (let v of inputs) h.update(v);
	let t = performance.now() - t0;
	console.log({name: x.name, t});
}

console.log('[finalize]');
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = random_bytes(1234567);
}
for (const x of HASHERS) {
	let hashers = inputs.map(v => {
		let h = x.make();
		h.update(v);
		return h;
	});
	const t0 = performance.now();
	hashers.forEach(h => h.bytes());
	let t = performance.now() - t0;
	console.log({name: x.name, t});
}