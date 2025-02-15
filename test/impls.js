import {Buffer} from 'node:buffer';

// this library
import {keccak} from '../src/keccak.js';

// https://github.com/phusion/node-sha3
import {Keccak as sha3_Keccak} from 'sha3';
export {sha3_Keccak};

// https://github.com/emn178/js-sha3
import JS_SHA3 from 'js-sha3';
export const js_sha3_keccak256 = JS_SHA3.keccak256;

// https://github.com/paulmillr/noble-hashes
import {Keccak} from 'sha3';

export const IMPLS = [
	{
		name: 'js_sha3',
		make() {
			let h = js_sha3_keccak256.create();
			return {
				update(v) { h.update(v); },
				bytes() { return new Uint8Array(h.arrayBuffer()); }
			};
		}
	},
	{
		name: 'sha3',
		make() {
			let h = new sha3_Keccak(256);
			return {
				update(v) { h.update(Buffer.from(v)); },
				bytes() {
					let buffer = Buffer.alloc(32);
					h.digest({buffer});
					return buffer;
				}
			};
		}
	},
	{
		name: 'noble',
		make() {
			let h = new Keccak(256);
			return {
				update(v) { h.update(Buffer.from(v)); },
				bytes() { return h.digest(); }
			}
		}
	},
	{
		base: true,
		name: 'adraffy',
		make() {
			let h = keccak();
			return {
				update(v) { h.update(v); },
				bytes() { return h.bytes; }
			};
		}
	}
].sort(() => Math.random() < 0.5);
