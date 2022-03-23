export type Point = { x: number; y: number };
export type QrCode = (0 | 1)[][];
export type Bits = (0 | 1)[];

export function scan(qrCode: QrCode) {
  const pointer = getPointer();
  const mode = getNBits(pointer, qrCode, 4).join("");
  const length = Number.parseInt(getNBits(pointer, qrCode, 8).splice(0, 8).join(""), 2);
  return Array(length)
    .fill(undefined)
    .map(() => bitsToChar(getNBits(pointer, qrCode, 8)))
    .join("");
}

export function getNBits(pointer: Generator<Point, Point, unknown>, qrCode: QrCode, n: number): Bits {
  const bits: Bits = [];
  for (let i = 0; i < n; i++) {
    const point = pointer.next().value;
    bits.push(getBit(qrCode, point));
  }
  return bits;
}

export function bitsToChar(bits: Bits): string {
  return String.fromCharCode(Number.parseInt(bits.join(""), 2));
}

export function getBit(qrCode: QrCode, point: Point) {
  const bit = qrCode[point.y][point.x];
  if ((point.x + point.y) % 2 === 0) {
    return Number(!bit) as 0 | 1;
  }
  return bit;
}

export function* getPointer() {
  const pointer: Point = { x: 20, y: 20 };
  let dy = -1;
  yield pointer;
  for (let i = 0; i < 80; i++) {
    if (pointer.x % 2 === 1) {
      if (pointer.y === 9 && dy < 0) {
        dy = -dy;
        pointer.y -= 1;
        pointer.x -= 2;
      } else if (pointer.y === 20 && pointer.x < 19 && dy > 0) {
        dy = -dy;
        pointer.y += 1;
        pointer.x -= 2;
      }
      pointer.y += dy;
      pointer.x += 1;
    } else {
      pointer.x -= 1;
    }
    yield pointer;
  }
  return pointer;
}
