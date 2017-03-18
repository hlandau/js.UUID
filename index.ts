import {randomBytes} from "crypto";

const hexChars = '0123456789abcdef';
const fromHex: {[x: string]: number} = {};
for (let i=0; i<hexChars.length; ++i) {
  fromHex[hexChars[i]] = i;
  fromHex[hexChars[i].toUpperCase()] = i;
}

function byteToHex(b: number): string {
  return hexChars[(b>>4)&0x0F] + hexChars[b & 0x0F];
}

function bytesToUUIDString(b: Uint8Array, i: number=0): string {
  return byteToHex(b[i++]) + byteToHex(b[i++]) +
    byteToHex(b[i++]) + byteToHex(b[i++]) + '-' +
    byteToHex(b[i++]) + byteToHex(b[i++]) + '-' +
    byteToHex(b[i++]) + byteToHex(b[i++]) + '-' +
    byteToHex(b[i++]) + byteToHex(b[i++]) + '-' +
    byteToHex(b[i++]) + byteToHex(b[i++]) +
    byteToHex(b[i++]) + byteToHex(b[i++]) +
    byteToHex(b[i++]) + byteToHex(b[i++])
    ;
}

// UNCHECKED
function hexToByte(x: string, i: number): number {
  const v1 = fromHex[x[i]];
  const v2 = fromHex[x[i+1]];
  if (v1 === undefined || v2 === undefined)
    throw new Error("invalid UUID string");
  return v1*16+v2;
}

const reUUID = /^([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})$/;

function parseUUID(s: string): Uint8Array {
  if (!s.match(reUUID))
    throw new Error("invalid UUID string");

  const a = new Uint8Array(16);
  a[ 0] = hexToByte(s,  0);
  a[ 1] = hexToByte(s,  2);
  a[ 2] = hexToByte(s,  4);
  a[ 3] = hexToByte(s,  6);
  // -
  a[ 4] = hexToByte(s,  9);
  a[ 5] = hexToByte(s, 11);
  // -
  a[ 6] = hexToByte(s, 14);
  a[ 7] = hexToByte(s, 16);
  // -
  a[ 8] = hexToByte(s, 19);
  a[ 9] = hexToByte(s, 21);
  // -
  a[10] = hexToByte(s, 24);
  a[11] = hexToByte(s, 26);
  a[12] = hexToByte(s, 28);
  a[13] = hexToByte(s, 30);
  a[14] = hexToByte(s, 32);
  a[15] = hexToByte(s, 34);
  return a;
}

export default class UUID {
  private __bytes: Uint8Array;

  constructor(spec: any) {
    if (spec instanceof Buffer || spec instanceof Array)
      spec = new Uint8Array(spec);

    if (spec instanceof Uint8Array) {
      if (spec.length !== 16)
        throw new Error("UUID can only be constructed from a Uint8Array if it is 16 bytes in length");

      this.__bytes = spec;
      return;
    }

    if (typeof spec === 'string') {
      this.__bytes = parseUUID(spec);
      return;
    }

    throw new Error("unexpected type passed to UUID constructor");
  }

  get bytes(): Uint8Array {
    return this.__bytes;
  }

  get urn(): string {
    return 'urn:uuid:' + this.toString();
  }

  toString(): string {
    return bytesToUUIDString(this.__bytes);
  }

  inspect(): string {
    return `UUID(${this.toString()})`;
  }

  static generate(): UUID {
    return UUID.v4();
  }

  static v4(): UUID {
    const b = randomBytes(16);
    b[6] = (b[6] & 0x0F) | 0x40;
    b[8] = (b[8] & 0x3F) | 0x80;
    return new UUID(b);
  }
}
