interface Hasher<T> {	
	update(input: Uint8Array | ArrayBuffer | number[] | string): T;
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

export function bytes_from_str(s: string): Uint8Array;
export function bytes_from_hex(s: string): Uint8Array;
export function hex_from_bytes(v: Uint8Array): string;