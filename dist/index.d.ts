interface Hasher<T> {	
	update(input: Uint8Array | ArrayBuffer | number[] | string): T;
	update_hex(input: string): T;
}

interface ExtendedHasher extends Hasher<ExtendedHasher> {
	hex(bytes: number): string;
	bytes(bytes: number): Uint8Array;
}

interface FixedHasher extends Hasher<FixedHasher> {
	get hex(): string;
	get bytes(): Uint8Array;
}

export function keccak(bits?: number): FixedHasher;
export function sha3(bits?: number): FixedHasher;
export function shake(bits: number): ExtendedHasher;

export function bytes_from_hex(s: string): Uint8Array;
export function hex_from_bytes(v: Uint8Array): string;

export function bytes_from_utf8(s: string): Uint8Array;
export function utf8_from_bytes(v: Uint8Array): string;

