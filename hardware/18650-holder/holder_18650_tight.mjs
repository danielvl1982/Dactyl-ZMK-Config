// Parametric 18650 / NCR18650B holder with seats for 9x9 / 10x10 solder-tab
// battery terminals (plate + 4 mm tab, 14 mm tall overall).
//
// Print: flat base on the bed, no supports, 0.2 mm layers, 3 perimeters, brim recommended.
// Re-generate: npm install manifold-3d && node holder_18650_tight.mjs [output-dir]
//
// Geometry (mm):
//   cell 18.5 x 65.8 | bore 18.9 | outer 22.9 | overall 73.6 x 22.9 x 20.0
//   half cradle: open above the cell axis, cell drops straight in
//   wall 2.0 | floor under the cell 1.3 | flat base 7.9 wide | end walls 2.0
//   negative end: 9.4 x 9.4 x 1.0 seat  + 4.4 wide tab channel to the top face
//   positive end: 10.4 x 10.4 x 1.0 seat + 4.4 wide tab channel to the top face
//
// The cradle wraps only the lower half of the cell, so the cell drops in with
// no flex. Close it with tape or heat shrink once the terminals are soldered.
//
// The terminal plates sit 1.0 mm into the end walls, so the cell presses them
// against the seat floor and they stay put. The tabs exit through the top of
// each end wall: solder the wire there and route it to the controller.
//
// The spring terminal stands 3.5 mm above its plate once the cell is fitted
// (free length 5-6 mm -> ~2 mm of preload). Change springInstalledH if yours
// is different: it sets the inner span and therefore the total length.

import Module from 'manifold-3d';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Parameters - edit and re-run
// ---------------------------------------------------------------------------
const P = {
  cellD: 18.5,     // NCR18650B diameter
  cellL: 65.8,     // cell length including the button top
  clearance: 0.4,  // diameter clearance of the bore (bore = cellD + clearance)

  wall: 2.0,       // cradle wall thickness
  rimAboveAxis: 0,  // cradle rim height above the cell axis (0 = half cradle)
  floorThick: 1.3, // material under the cell at the flat base

  endNegThick: 2.0, // negative end wall (spring terminal)
  endPosThick: 2.0, // positive end wall (dome terminal)

  negPlate: 9.0,    // spring terminal plate (0.9 cm)
  posPlate: 10.0,   // dome terminal plate (1.0 cm)
  seatClearance: 0.4, // total clearance of the seat around the plate
  seatDepth: 1.0,     // how deep the plate sits in the end wall

  tabW: 4.0,        // tab width
  tabClearance: 0.4,
  tabLen: 4.0,      // tab length beyond the plate edge

  plateThick: 0.4,        // terminal plate thickness
  springInstalledH: 3.5,  // spring height above its plate with the cell fitted
  domeProtrusion: 1.5,    // positive dome height above its plate

  segments: 200,
  outBase: 'holder_18650_tight',
};

// ---------------------------------------------------------------------------
// Derived geometry
// ---------------------------------------------------------------------------
const boreR = (P.cellD + P.clearance) / 2;
const outerR = boreR + P.wall;
const baseZ = -(boreR + P.floorThick); // flat bottom plane
const topZ = P.cellD / 2;              // end walls trimmed flush with the cell top

// How far each terminal protrudes past the wall face towards the cell
const plateBack = P.seatDepth - P.plateThick;          // plate face behind the wall face
const negGap = P.springInstalledH - plateBack;         // spring tip past the neg wall face
const posGap = P.domeProtrusion - plateBack;           // dome apex past the pos wall face
const innerSpan = P.cellL + negGap + posGap;           // wall face to wall face
const L = P.endNegThick + innerSpan + P.endPosThick;

const seatNeg = P.negPlate + P.seatClearance;
const seatPos = P.posPlate + P.seatClearance;
const tabSlotW = P.tabW + P.tabClearance;

const wasm = await Module();
wasm.setup();
const { Manifold } = wasm;

const EPS = 1.0;

/** Cylinder along +X from x0 to x0+len. r1 = radius at x0, r2 = radius at x0+len. */
const cylX = (r1, r2, len, x0) =>
  Manifold.cylinder(len, r1, r2, P.segments, false).rotate([0, 90, 0]).translate([x0, 0, 0]);

/** Axis-aligned box. */
const box = (x0, x1, y0, y1, z0, z1) =>
  Manifold.cube([x1 - x0, y1 - y0, z1 - z0], false).translate([x0, y0, z0]);

/** Rectangular seat + tab channel cut into an end wall.
 *  xFace: x of the wall face (pocket opens towards the cell, opposite to xDir)
 *  xDir : +1 if the wall lies at larger x than the pocket, -1 otherwise */
function terminalSeat(xFace, xDir, seat, plateHalf, seatDepth, tabSlotW, topZ) {
  const xIn = xFace - xDir * seatDepth;      // pocket floor
  const xOut = xFace + xDir * EPS;           // overshoot into the bore
  const x0 = Math.min(xIn, xOut), x1 = Math.max(xIn, xOut);
  const h = seat / 2;
  const seatCut = box(x0, x1, -h, h, -h, h);
  const tabCut = box(x0, x1, -tabSlotW / 2, tabSlotW / 2, plateHalf, topZ + EPS);
  return seatCut.add(tabCut);
}

// ---------------------------------------------------------------------------
// Solid
// ---------------------------------------------------------------------------
let part = cylX(outerR, outerR, L, 0);

// Flat bottom: the part sits on the bed / case floor
part = part.subtract(box(-EPS, L + EPS, -50, 50, -50, baseZ));

// End walls trimmed flush with the top of the cell
part = part.subtract(box(-EPS, L + EPS, -50, 50, topZ, 50));

// Main bore between both end walls
part = part.subtract(cylX(boreR, boreR, innerSpan, P.endNegThick));

// Half cradle: open above the cell axis so the cell drops straight in
part = part.subtract(box(P.endNegThick, L - P.endPosThick, -50, 50, P.rimAboveAxis, 50));

// Negative end wall: seat for the 9x9 spring terminal + tab channel
part = part.subtract(
  terminalSeat(P.endNegThick, -1, seatNeg, P.negPlate / 2, P.seatDepth, tabSlotW, topZ),
);

// Positive end wall: seat for the 10x10 dome terminal + tab channel
part = part.subtract(
  terminalSeat(L - P.endPosThick, +1, seatPos, P.posPlate / 2, P.seatDepth, tabSlotW, topZ),
);

// Sit on the bed
part = part.translate([0, 0, -baseZ]);

// ---------------------------------------------------------------------------
// Checks / report
// ---------------------------------------------------------------------------
const bb = part.boundingBox();
const size = bb.max.map((v, i) => v - bb.min[i]);
console.log('status      :', part.status());
console.log('volume      : %s mm3 (~%s g PLA)', part.volume().toFixed(0), (part.volume() * 0.00124).toFixed(1));
console.log('size        : %s x %s x %s mm', ...size.map((v) => v.toFixed(2)));
console.log('bore        : %s mm | outer: %s mm', (boreR * 2).toFixed(2), (outerR * 2).toFixed(2));
console.log('inner span  : %s mm (cell %s + spring %s + dome %s)', innerSpan.toFixed(2), P.cellL, negGap.toFixed(2), posGap.toFixed(2));
console.log('seats       : neg %s | pos %s mm square, %s deep', seatNeg.toFixed(2), seatPos.toFixed(2), P.seatDepth);
console.log('tab channel : %s mm wide, to the top face', tabSlotW.toFixed(2));

// ---------------------------------------------------------------------------
// STL export
// ---------------------------------------------------------------------------
function writeBinarySTL(manifold, file) {
  const mesh = manifold.getMesh();
  const vp = mesh.vertProperties;
  const stride = mesh.numProp;
  const tri = mesh.triVerts;
  const nTri = tri.length / 3;
  const buf = Buffer.alloc(84 + nTri * 50);
  buf.write('18650 holder - generated', 0, 'ascii');
  buf.writeUInt32LE(nTri, 80);
  let off = 84;
  for (let i = 0; i < nTri; i++) {
    const ia = tri[i * 3], ib = tri[i * 3 + 1], ic = tri[i * 3 + 2];
    const ax = vp[ia * stride], ay = vp[ia * stride + 1], az = vp[ia * stride + 2];
    const bx = vp[ib * stride], by = vp[ib * stride + 1], bz = vp[ib * stride + 2];
    const cx = vp[ic * stride], cy = vp[ic * stride + 1], cz = vp[ic * stride + 2];
    let nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
    let ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    let nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    for (const v of [nx, ny, nz, ax, ay, az, bx, by, bz, cx, cy, cz]) { buf.writeFloatLE(v, off); off += 4; }
    buf.writeUInt16LE(0, off); off += 2;
  }
  fs.writeFileSync(file, buf);
  return nTri;
}

const outDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.dirname(fileURLToPath(import.meta.url));

const main = path.join(outDir, `${P.outBase}.stl`);
const mirror = path.join(outDir, `${P.outBase}_mirrored.stl`);

console.log('\nwrote %s (%s tris)', main, writeBinarySTL(part, main).toLocaleString('en-US'));
const mirrored = part.mirror([1, 0, 0]).translate([L, 0, 0]);
console.log('wrote %s (%s tris)', mirror, writeBinarySTL(mirrored, mirror).toLocaleString('en-US'));
