// Parametric cap ("capuchón") for the 7x7x14 mm push switch: a hollow shell whose
// socket the original square head plugs into, standing the button out of the case
// so it can be pressed with the shell closed.
//
// Print: closed top on the bed, socket opening upwards, no supports.
// Re-generate: npm install manifold-3d && node switch_cap.mjs [output-dir]
//
// In use orientation, from the outside in:
//
//     ┌───────────────┐   <- flat pad, pressed with a finger
//     │               │
//     │               │   <- solid reach, as tall as the case needs
//     │  ┌─────────┐  │
//     │  │  socket │  │   <- the original 7x7 square head goes in here
//     │  │  (open) │  │
//     └──┴─────────┴──┘
//
// The STL is exported flipped: closed top on the bed and the socket opening up,
// so the cavity has no ceiling to bridge. Flip the part after printing.
//
// Geometry warning that drives capD: the socket is square, its diagonal is
// switchW * 1.414, so a round shell has to be wider than that diagonal or the
// socket corners break through the wall. The report prints the wall at the
// corners, which is the number that matters, not the flat-side wall. The socket
// corners are rounded so the cap can be narrower and so it centres itself on the
// head instead of jamming on its corners.
//
// Two numbers depend on your build:
//   switchW    the square head across flats, measured with a caliper.
//   capH       total height; it is what carries the button out through the case.

import Module from 'manifold-3d';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Parameters - edit and re-run
// ---------------------------------------------------------------------------
const P = {
  // Head of the switch that plugs into the cap
  switchW: 7.0,          // MEASURE: square head across flats
  socketClearance: 0.3,  // total play of the socket; smaller = tighter
  socketCornerR: 1.5,    // rounded socket corners, self-centring
  socketDepth: 4.0,      // how deep the head sits inside the cap
  leadIn: 0.6,           // relieved step at the mouth so the cap starts onto the head
  leadInPlay: 0.8,       // how much wider that step is, across

  // Cap body
  capD: 11.2,            // outer diameter; must clear the socket diagonal
  capH: 12.0,            // MEASURE: total height, i.e. how far it must stand out of the case

  segments: 96,
  outBase: 'switch_cap',
};

// ---------------------------------------------------------------------------
// Derived geometry
// ---------------------------------------------------------------------------
const socket = P.switchW + P.socketClearance;
const cornerR = Math.min(P.socketCornerR, socket / 2 - 0.1);
const socketApothem = socket / 2;                     // flat side to centre
const socketDiagonal = Math.SQRT2 * (socketApothem - cornerR) + cornerR;
const wallFlat = P.capD / 2 - socketApothem;
const wallCorner = P.capD / 2 - socketDiagonal;
const topThick = P.capH - P.socketDepth;

const EPS = 1.0;

const wasm = await Module();
wasm.setup();
const { Manifold } = wasm;

const cyl = (r, h, z0) =>
  Manifold.cylinder(h, r, r, P.segments, false).translate([0, 0, z0]);

/** Square of side s with corner radius r, extruded from z0 to z0+h. */
const roundedSquare = (s, r, h, z0) => {
  const inner = s - 2 * r;
  const off = s / 2 - r;
  let m = Manifold.cube([inner, inner, h], false).translate([-inner / 2, -inner / 2, z0]);
  for (const [x, y] of [[off, off], [off, -off], [-off, off], [-off, -off]]) {
    m = m.add(cyl(r, h, z0).translate([x, y, 0]));
  }
  return m;
};

// ---------------------------------------------------------------------------
// Solid - print orientation (closed top on the bed, socket opening up)
// ---------------------------------------------------------------------------
let part = cyl(P.capD / 2, P.capH, 0);

// Socket: open counterbore from the top face
const socketZ = P.capH - P.socketDepth;
part = part.subtract(roundedSquare(socket, cornerR, P.socketDepth + EPS, socketZ));

// Relieved mouth: a slightly wider step for the last leadIn mm, so the cap
// starts onto the head instead of catching on its edge
if (P.leadIn > 0) {
  part = part.subtract(
    roundedSquare(socket + P.leadInPlay, cornerR + P.leadInPlay / 2, P.leadIn + EPS, P.capH - P.leadIn),
  );
}

// ---------------------------------------------------------------------------
// Checks / report
// ---------------------------------------------------------------------------
const bb = part.boundingBox();
const size = bb.max.map((v, i) => v - bb.min[i]);

console.log('status        :', part.status());
console.log('size          : %s x %s x %s mm', ...size.map((v) => v.toFixed(2)));
console.log('volume        : %s mm3 (~%s g PLA)', part.volume().toFixed(0), (part.volume() * 0.00124).toFixed(2));
console.log('cap           : %s mm dia, %s mm tall', P.capD.toFixed(2), P.capH.toFixed(2));
console.log('socket        : %s mm square, corner R%s, %s mm deep',
  socket.toFixed(2), cornerR.toFixed(2), P.socketDepth.toFixed(2));
console.log('lead-in       : %s mm step, %s mm wider, at the mouth', P.leadIn.toFixed(2), P.leadInPlay.toFixed(2));
console.log('wall          : %s mm flat, %s mm at the corners', wallFlat.toFixed(2), wallCorner.toFixed(2));

const problems = [];
if (wallCorner < 0.8) {
  problems.push(`corner wall is ${wallCorner.toFixed(2)} mm: the ${socket.toFixed(1)} mm socket diagonal does not fit a ${P.capD} mm shell, raise capD to at least ${((socketDiagonal + 0.8) * 2).toFixed(1)}`);
}
if (topThick < 1.2) problems.push(`top is only ${topThick.toFixed(2)} mm thick: raise capH or lower socketDepth`);
if (P.socketDepth < P.switchW * 0.4) problems.push(`socket ${P.socketDepth} mm is shallow for a ${P.switchW} mm head, the cap will rock`);
if (P.leadIn >= P.socketDepth) problems.push(`lead-in ${P.leadIn} mm is as deep as the socket`);
if (problems.length) {
  console.log('\nFIT PROBLEMS');
  for (const p of problems) console.log('  - ' + p);
} else {
  console.log('\nfit           : ok');
}

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
  buf.write('switch cap - generated', 0, 'ascii');
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

const out = path.join(outDir, `${P.outBase}.stl`);
console.log('\nwrote %s (%s tris)', out, writeBinarySTL(part, out).toLocaleString('en-US'));
