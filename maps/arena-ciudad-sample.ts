import type { SeatMapGeometry } from "../components/SeatMap";

const arenaCiudadSample: SeatMapGeometry = {
  viewBox: "0 0 1000 700",
  rects: [
    // top ring
    { id: "301", x: 180, y: 60,  w: 120, h: 60 },
    { id: "302", x: 320, y: 60,  w: 120, h: 60 },
    { id: "303", x: 460, y: 60,  w: 120, h: 60 },
    { id: "304", x: 600, y: 60,  w: 120, h: 60 },
    { id: "305", x: 740, y: 60,  w: 120, h: 60 },
    // bottom ring
    { id: "201", x: 180, y: 580, w: 120, h: 60 },
    { id: "202", x: 320, y: 580, w: 120, h: 60 },
    { id: "203", x: 460, y: 580, w: 120, h: 60 },
    { id: "204", x: 600, y: 580, w: 120, h: 60 },
    { id: "205", x: 740, y: 580, w: 120, h: 60 },
    // left ring
    { id: "110", x: 80,  y: 240, w: 100, h: 70 },
    { id: "111", x: 80,  y: 330, w: 100, h: 70 },
    { id: "112", x: 80,  y: 420, w: 100, h: 70 },
    // right ring
    { id: "120", x: 820, y: 240, w: 100, h: 70 },
    { id: "121", x: 820, y: 330, w: 100, h: 70 },
    { id: "122", x: 820, y: 420, w: 100, h: 70 },
    // field
    { id: "F1", x: 340, y: 220, w: 320, h: 220, label: "Pista" },
  ],
};

export default arenaCiudadSample;
