import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

// libc crypt implementation, based on Apache commons-codec Md5Crypt
// depends on CryptJS library
@Injectable({ providedIn: 'root' })
export class CryptService {
    private b64t: string = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    private prefix: string = '$1$';
    private separator: string = '$';
    private rounds: number = 1000;
    private cryptoArray = new Uint32Array(1);

    public crypt(key: string) {
        return this.cryptSalt(key, this.generateSalt(8));
    }

    public cryptSalt(key: string, salt: string) {
        const keyLen = key.length;
        const ctx = CryptoJS.enc.Utf8.parse(key + this.prefix + salt);
        let ctx1 = CryptoJS.enc.Utf8.parse(key + salt + key);
        let finalb = CryptoJS.MD5(ctx1);

        let ii: number = keyLen;
        while (ii > 0) {
            ctx.concat(this._copyBytes(finalb, 0, ii > 16 ? 16 : ii));
            ii -= 16;
        }

        ii = keyLen;
        const j = 0;
        while (ii > 0) {
            if ((ii & 1) === 1) {
                ctx.concat(CryptoJS.enc.Hex.parse('00'));
            } else {
                ctx.concat(CryptoJS.enc.Utf8.parse(key.substring(j, j + 1)));
            }
            ii >>= 1;
        }

        finalb = CryptoJS.MD5(ctx);

        for (let i = 0; i < this.rounds; i++) {
            // @ts-ignore
            ctx1 = CryptoJS.lib.WordArray.create();

            if ((i & 1) !== 0) {
                ctx1.concat(CryptoJS.enc.Utf8.parse(key));
            } else {
                ctx1.concat(finalb);
            }

            if (i % 3 !== 0) {
                ctx1.concat(CryptoJS.enc.Utf8.parse(salt));
            }

            if (i % 7 !== 0) {
                ctx1.concat(CryptoJS.enc.Utf8.parse(key));
            }

            if ((i & 1) !== 0) {
                ctx1.concat(finalb);
            } else {
                ctx1.concat(CryptoJS.enc.Utf8.parse(key));
            }
            finalb = CryptoJS.MD5(ctx1);
        }

        let passwd = this.prefix + salt + this.separator;

        passwd += this._b64from24bit(this._getByte(finalb, 0), this._getByte(finalb, 6), this._getByte(finalb, 12), 4);
        passwd += this._b64from24bit(this._getByte(finalb, 1), this._getByte(finalb, 7), this._getByte(finalb, 13), 4);
        passwd += this._b64from24bit(this._getByte(finalb, 2), this._getByte(finalb, 8), this._getByte(finalb, 14), 4);
        passwd += this._b64from24bit(this._getByte(finalb, 3), this._getByte(finalb, 9), this._getByte(finalb, 15), 4);
        passwd += this._b64from24bit(this._getByte(finalb, 4), this._getByte(finalb, 10), this._getByte(finalb, 5), 4);
        passwd += this._b64from24bit(0, 0, this._getByte(finalb, 11), 2);

        return passwd;
    }

    private _getByte(wordArray: any, offset: number) {
        return (wordArray.words[offset >>> 2] >>> (24 - (offset % 4) * 8)) & 0xff;
    }

    private _setByte(wordArray: any, offset: number, value: number) {
        wordArray.words[(wordArray.sigBytes + offset) >>> 2] |= value << (24 - ((wordArray.sigBytes + offset) % 4) * 8);
    }

    private _copyBytes(wordArray: any, offset: number, length: number) {
        // @ts-ignore
        const result = CryptoJS.lib.WordArray.create();

        for (let i = offset; i < offset + length; i++) {
            this._setByte(result, i, this._getByte(wordArray, i));
        }

        result.sigBytes = length;
        return result;
    }

    private _b64from24bit(b2: number, b1: number, b0: number, outLen: number): string {
        let w = ((b2 << 16) & 0x00ffffff) | ((b1 << 8) & 0x00ffff) | (b0 & 0xff);
        let n = outLen;
        let result = '';
        while (n-- > 0) {
            result += this.b64t[w & 0x3f];
            w >>= 6;
        }
        return result;
    }

    private generateSalt(length: number) {
        let result = '';
        for (let index = 0; index < length; index++) {
            window.crypto.getRandomValues(this.cryptoArray);
            const randomNumber = this.cryptoArray[0] / (0xffffffff + 1);
            const offset = Math.floor(randomNumber * this.b64t.length);
            result = result.concat(this.b64t[offset]);
        }
        return result;
    }
}
