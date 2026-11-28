export type ParkingArea = 'front' | 'right' | 'rear';

export type ParkingZoneType = 'box' | 'single';

export interface ParkingZone {
  id: string;
  area: ParkingArea;
  type: ParkingZoneType;
  x: number;
  z: number;
  width: number;
  depth: number;
}

export const parkingZones: ParkingZone[] = [
  // ==========================
  // FRONT — 6 parking boxes
  // ==========================

  ...Array.from({ length: 6 }, (_, index): ParkingZone => ({
    id: `Front${index + 1}`,
    area: 'front',
    type: 'box',
    x: -30 + index * 12,
    z: 28,
    width: 10.5,
    depth: 7
  })),

  // ==========================
  // RIGHT — 7 parking boxes
  // ==========================

  ...[32, 22, 12, 0, -13, -24, -35].map(
    (z, index): ParkingZone => ({
      id: `Right${index + 1}`,
      area: 'right',
      type: 'box',
      x: -38,
      z,
      width: 5.5,
      depth: index === 3 ? 3 : 8
    })
  ),

  // ==========================
  // REAR — 18 individual slots
  // ==========================

  ...Array.from({ length: 18 }, (_, index): ParkingZone => ({
    id: `Rear${index + 1}`,
    area: 'rear',
    type: 'single',
    x: -33 + index * 3.8,
    z: 0.3,
    width: 3.4,
    depth: 2.8
  })),

  // ==========================
  // REAR — 2 additional boxes
  // ==========================

  {
    id: 'Rear19',
    area: 'rear',
    type: 'box',
    x: 41,
    z: 0,
    width: 7,
    depth: 5
  },
  {
    id: 'Rear20',
    area: 'rear',
    type: 'box',
    x: 41,
    z: -13,
    width: 7,
    depth: 7
  }
];