import * as THREE from 'three';
import {
  ParkingZone,
  parkingZones
} from '../../../config/parking-layout';

export function createParkingZones(
  scene: THREE.Scene
): THREE.Group {
  const group = new THREE.Group();

  group.name = 'parking-zones';

  const materials = {
    asphalt: new THREE.MeshStandardMaterial({
      color: '#68727c',
      roughness: 0.95
    }),

    border: new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.8
    }),

    line: new THREE.MeshBasicMaterial({
      color: '#ffffff'
    })
  };

  function createSurface(
    width: number,
    depth: number,
    height: number,
    material: THREE.Material
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.receiveShadow = true;

    return mesh;
  }

  function createLabel(
    zone: ParkingZone
  ): THREE.Mesh {
    const canvas = document.createElement('canvas');

    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext('2d')!;

    // Label background
    context.fillStyle = '#172b4d';
    context.fillRect(0, 0, 512, 128);

    // Label text
    context.fillStyle = '#ffffff';
    context.font = 'bold 76px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(zone.id, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    const labelWidth = zone.type === 'box'
      ? zone.width * 0.8
      : zone.width * 0.95;

    const labelDepth = labelWidth / 4;

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(
        labelWidth,
        labelDepth
      ),
      material
    );

    label.rotation.x = -Math.PI / 2;

    label.position.set(
      0,
      0.25,
      zone.depth / 2 - labelDepth / 2 - 0.1
    );

    return label;
  }

  function createParkingZone(
    zone: ParkingZone
  ): THREE.Group {
    const parkingGroup = new THREE.Group();

    parkingGroup.name = zone.id;

    parkingGroup.userData = {
      zoneId: zone.id,
      type: zone.type
    };

    // Border
    const border = createSurface(
      zone.width + 0.25,
      zone.depth + 0.25,
      0.16,
      materials.border
    );

    border.position.y = 0.08;

    parkingGroup.add(border);

    // Parking surface
    const surface = createSurface(
      zone.width,
      zone.depth,
      0.18,
      materials.asphalt
    );

    surface.position.y = 0.09;

    surface.name = 'parking-surface';

    parkingGroup.add(surface);

    // Parking lines
    if (zone.type === 'box') {
      const spacesPerRow = 5;
      const spacing = zone.width / spacesPerRow;

      for (let i = 1; i < spacesPerRow; i++) {
        const x =
          -zone.width / 2 + i * spacing;

        for (const direction of [-1, 1]) {
          const line = createSurface(
            0.07,
            zone.depth * 0.3,
            0.02,
            materials.line
          );

          line.position.set(
            x,
            0.20,
            direction * zone.depth * 0.33
          );

          parkingGroup.add(line);
        }
      }
    }

    // Parking zone name
    parkingGroup.add(createLabel(zone));

    // Position on map
    parkingGroup.position.set(
      zone.x,
      0,
      zone.z
    );

    return parkingGroup;
  }

  parkingZones.forEach(zone => {
    group.add(createParkingZone(zone));
  });

  scene.add(group);

  return group;
}