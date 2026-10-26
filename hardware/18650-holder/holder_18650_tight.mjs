// Parametric 18650 / NCR18650B holder with seats for 9x9 / 10x10 solder-tab
// battery terminals (plate + 4 mm tab).
//
// Print: flat base on the bed, no supports, 0.2 mm layers, 3 perimeters, brim recommended.
// Re-generate: npm install manifold-3d && node holder_18650_tight.mjs [output-dir]
//
// Geometry (mm):
//   cell 18.5 x 65.8 | bore 18.9 | outer 22.9 | overall 73.6 x 22.9 x 10.75
//   half cradle: open above the cell axis, cell drops straight in
//   wall 2.0 | floor under the cell 1.3 | flat base 7.9 wide
//   end walls 2.0, trimmed flush with the cradle rim (endWallAboveAxis = 0)
//   negative end: 9.4 x 9.4 seat  + 10.4 x 10.4 positive seat, 1.0 mm deep
//
// The cradle wraps only the lower half of the cell, so the cell drops in with
// no flex. Close it with tape or heat shrink once the terminals are soldered.
//
// The end walls stop flush with the cradle rim, so the terminal plates sit in a
// half-pocket: the lower half of the plate is keyed and the upper half is exposed
// above the rim. That is deliberate, to keep the holder low enough to fit inside
// the case. Because the plates are no longer enclosed, glue them to their seat
// floor and cover the assembly with tape or heat shrink before fitting the cell.
//
// The terminal plates sit 1.0 mm into the end walls, so the cell presses them
// against the seat floor. The tab channel above the plate is only cut while the
// wall still rises above it; with the walls flush there is no wall left to cut,
// and the tab stands free above the rim.
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

  retainW: 4.0,      // centered half ring (retaining lips) width along the cell (0 = none)
  retainAngle: 32,   // how far the lips climb above the cell axis, in degrees
                     // opening = bore * cos(angle): 20 -> 17.8 mm, 32 -> 16.0 mm

  endNegThick: 2.0, // negative end wall (spring terminal)
  endPosThick: 2.0, // positive end wall (dome terminal)
  endWallAboveAxis: 0, // height the end walls reach above the cell axis
                       // 0 = flush with the cradle rim, which is the low profile
                       // the case needs. Raise it to re-enclose the terminal
                       // plates if the holder is used without a wrap.

  negPlate: 9.0,    // spring terminal plate (0.9 cm)
  posPlate: 10.0,   // dome terminal plate (1.0 cm)
  seatClearance: 0.4, // total clearance of the seat around the plate
  seatDepth: 1.0,     // how deep the plate sits in the end wall

  earAbovePlate: 2, // retaining ear: height above the plate top edge (0 = no ears)
  earSide: 1.2,       // ear material either side of the tab slot
  tabGroove: 0.6,     // depth of the groove the folded-back tab lies in
  earChamfer: 0.6,    // chamfer on the long top edges of the ears (0 = sharp)
  wireSlotW: 2.0,     // central slot through each ear for the soldered wire: width (0 = none)
  wireSlotDepth: 2.5, // wire slot depth below the ear top

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
const topZ = P.endWallAboveAxis;       // end walls stop here, flush with the rim at 0

// How far each terminal protrudes past the wall face towards the cell
const plateBack = P.seatDepth - P.plateThick;          // plate face behind the wall face
const negGap = P.springInstalledH - plateBack;         // spring tip past the neg wall face
const posGap = P.domeProtrusion - plateBack;           // dome apex past the pos wall face
const innerSpan = P.cellL + negGap + posGap;           // wall face to wall face
const L = P.endNegThick + innerSpan + P.endPosThick;

const seatNeg = P.negPlate + P.seatClearance;
const seatPos = P.posPlate + P.seatClearance;
const tabSlotW = P.tabW + P.tabClearance;
const earW = tabSlotW + 2 * P.earSide;

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

/** Rectangular seat. With a retaining ear, also a vertical slot for the tab to
 *  rise through and a groove on the ear top where the tab folds back.
 *  xFace: x of the wall face (pocket opens towards the cell, opposite to xDir)
 *  xDir : +1 if the wall lies at larger x than the pocket, -1 otherwise
 *  xBack: x of the outer (back) face of the wall */
function terminalSeat(xFace, xDir, xBack, seat, plateHalf, seatDepth, tabSlotW, earTop) {
  const xIn = xFace - xDir * seatDepth;      // pocket floor
  const xOut = xFace + xDir * EPS;           // overshoot into the bore
  const x0 = Math.min(xIn, xOut), x1 = Math.max(xIn, xOut);
  const h = seat / 2;
  let cut = box(x0, x1, -h, h, -h, h);
  if (earTop > 0) {
    // slot above the plate: the tab rises through it
    cut = cut.add(box(x0, x1, -tabSlotW / 2, tabSlotW / 2, plateHalf, earTop + EPS));
    // groove along the ear top, from the slot out past the back face
    const xEnd = xBack + xDir * EPS;
    cut = cut.add(box(Math.min(xIn, xEnd), Math.max(xIn, xEnd), -tabSlotW / 2, tabSlotW / 2,
      earTop - P.tabGroove, earTop + EPS));
    // central slot through the whole ear thickness: the soldered wire passes here
    if (P.wireSlotW > 0) {
      const xa = Math.min(xFace, xBack) - EPS, xb = Math.max(xFace, xBack) + EPS;
      cut = cut.add(box(xa, xb, -P.wireSlotW / 2, P.wireSlotW / 2,
        earTop - P.wireSlotDepth, earTop + EPS));
    }
  }
  return cut;
}

/** Retaining ear over a whole end wall thickness, from the rim up to earTop. */
const ear = (xA, xB, earTop) =>
  box(Math.min(xA, xB), Math.max(xA, xB), -earW / 2, earW / 2, -1, earTop);

// ---------------------------------------------------------------------------
// Solid
// ---------------------------------------------------------------------------
let part = cylX(outerR, outerR, L, 0);

// Flat bottom: the part sits on the bed / case floor
part = part.subtract(box(-EPS, L + EPS, -50, 50, -50, baseZ));

// End walls trimmed flush with the cradle rim
part = part.subtract(box(-EPS, P.endNegThick, -50, 50, topZ, 50));
part = part.subtract(box(L - P.endPosThick, L + EPS, -50, 50, topZ, 50));
// Cradle sides between the end walls stop at the rim
part = part.subtract(box(P.endNegThick, L - P.endPosThick, -50, 50, P.rimAboveAxis, 50));

// Retaining ears (added after the trim, before the seats are cut)
const earTopNeg = P.earAbovePlate > 0 ? P.negPlate / 2 + P.earAbovePlate : 0;
const earTopPos = P.earAbovePlate > 0 ? P.posPlate / 2 + P.earAbovePlate : 0;
if (P.earAbovePlate > 0) {
  part = part.add(ear(0, P.endNegThick, earTopNeg)).add(ear(L - P.endPosThick, L, earTopPos));
  if (P.earChamfer > 0) {
    // 45 degree chamfer on the two long top edges of each ear
    const s = P.earChamfer * Math.SQRT2;
    for (const [xA, xB, zTop] of [[0, P.endNegThick, earTopNeg], [L - P.endPosThick, L, earTopPos]]) {
      for (const y of [-earW / 2, earW / 2]) {
        part = part.subtract(
          Manifold.cube([xB - xA + 2 * EPS, s, s], true).rotate([45, 0, 0]).translate([(xA + xB) / 2, y, zTop]));
      }
    }
  }
}

// Main bore between both end walls
part = part.subtract(cylX(boreR, boreR, innerSpan, P.endNegThick));

// Half cradle: open above the cell axis so the cell drops straight in
part = part.subtract(box(P.endNegThick, L - P.endPosThick, -50, 50, P.rimAboveAxis, 50));

// Centered half ring: two lips that wrap just past the cell axis so the cell
// snaps in and cannot fall out. The opening between the lips is narrower than the cell.
if (P.retainW > 0) {
  const lipZ = boreR * Math.sin((P.retainAngle * Math.PI) / 180);
  const xc = L / 2 - P.retainW / 2;
  const lips = cylX(outerR, outerR, P.retainW, xc)
    .subtract(cylX(boreR, boreR, P.retainW + 2 * EPS, xc - EPS))
    .intersect(box(xc - EPS, xc + P.retainW + EPS, -50, 50, 0, lipZ));
  part = part.add(lips);
  console.log('retain ring : %s mm wide, lips to %s mm above axis, opening %s mm vs cell %s',
    P.retainW, lipZ.toFixed(2), (2 * Math.sqrt(boreR ** 2 - lipZ ** 2)).toFixed(2), P.cellD);
}

// Negative end wall: seat for the 9x9 spring terminal
part = part.subtract(
  terminalSeat(P.endNegThick, -1, 0, seatNeg, P.negPlate / 2, P.seatDepth, tabSlotW, earTopNeg),
);

// Positive end wall: seat for the 10x10 dome terminal
part = part.subtract(
  terminalSeat(L - P.endPosThick, +1, L, seatPos, P.posPlate / 2, P.seatDepth, tabSlotW, earTopPos),
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
console.log('end walls   : %s mm thick, to %s mm above the cell axis (%s)',
  P.endNegThick.toFixed(2), topZ.toFixed(2), topZ === 0 ? 'flush with the rim' : 'enclosed');
console.log('seats       : neg %s | pos %s mm square, %s deep', seatNeg.toFixed(2), seatPos.toFixed(2), P.seatDepth);
console.log('ears        : %s', P.earAbovePlate > 0
  ? `${earW.toFixed(1)} mm wide, to ${earTopNeg.toFixed(1)} (neg) / ${earTopPos.toFixed(1)} (pos) mm above the axis, tab slot ${tabSlotW.toFixed(1)} mm`
  : 'none');

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
