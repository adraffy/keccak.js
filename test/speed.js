import {IMPLS} from './impls.js';
import {hex_from_bytes, random_bytes, random_chunks} from '../src/utils.js';

function batch_hash(inputs) {
	format_results(IMPLS.map(x => {
		const t0 = performance.now();
		let hh = x.make();
		for (let chunks of inputs) {
			let h = x.make();
			for (let v of chunks) h.update(v);
			hh.update(h.bytes());
		}
		let sig = hex_from_bytes(hh.bytes());
		return {...x, t: performance.now() - t0, sig};
	}));
}

function format_results(m) {
	let n = Math.max(...m.map(x => x.name.length));
	m.sort((a, b) => a.t - b.t).forEach(({name, t, sig}) => {
		let line = `${name.padStart(n)} | ${t.toFixed(0).padStart(7)}`;
		if (sig) line += ` | ${sig}`;
		console.log(line);
	});
}

let inputs = Array(100);

console.log('[One Chunk]')
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = [random_bytes(Math.random() * 1000000 | 0)];
}
batch_hash(inputs);

console.log('[Multi Chunk]')
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = random_chunks((Math.random() * 1000000) | 0);
}
batch_hash(inputs);

console.log('[Block-aligned Chunk]');
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = [random_bytes(34 * 4 * (i + 1) * 100)];
}
batch_hash(inputs);

console.log('[constructor]');
format_results(IMPLS.map(impl => {
	const t0 = performance.now();
	for (let i = 0; i < 1000000; i++) impl.make();
	let t = performance.now() - t0;
	return {...impl, t};
}));

console.log('[update]');
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = random_bytes(1234567);
}
format_results(IMPLS.map(impl => {
	let h = impl.make();
	const t0 = performance.now();
	for (let v of inputs) h.update(v);
	let t = performance.now() - t0;
	return {...impl, t};
}));

console.log('[finalize]');
for (let i = 0; i < inputs.length; i++) {
	inputs[i] = random_bytes(1234567);
}
format_results(IMPLS.map(impl => {
	let hashers = inputs.map(v => {
		let h = impl.make();
		h.update(v);
		return h;
	});
	const t0 = performance.now();
	hashers.forEach(h => h.bytes());
	let t = performance.now() - t0;
	return {...impl, t};
}));