import {shake} from '../keccak.js';


let h = shake(128);

for (let i = 0; i < 10; i++) {
    console.log(h.hex());
}