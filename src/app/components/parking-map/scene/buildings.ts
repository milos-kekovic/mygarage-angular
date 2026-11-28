import * as THREE from 'three';

interface BuildingConfig {
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  isHome?: boolean;
}

const floorHeight = 3;

const materials = {
  wall: new THREE.MeshStandardMaterial({
    color: '#ded4c3'
  }),

  roof: new THREE.MeshStandardMaterial({
    color: '#976e5c'
  }),

  window: new THREE.MeshStandardMaterial({
    color: '#38566b',
    metalness: 0.3,
    roughness: 0.2
  }),

  balcony: new THREE.MeshStandardMaterial({
    color: '#e8e5dd'
  }),

  railing: new THREE.MeshStandardMaterial({
    color: '#65747b'
  }),

  home: new THREE.MeshStandardMaterial({
    color: '#ef4444',
    emissive: '#ef4444',
    emissiveIntensity: 0.4
  })
};

function createBox(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
  x: number,
  y: number,
  z: number
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createBuilding(
  config: BuildingConfig
): THREE.Group {
  const group = new THREE.Group();

  const { width, depth, floors, isHome } = config;

  const height = floors * floorHeight;

  // Main building
  group.add(
    createBox(
      width,
      height,
      depth,
      materials.wall,
      0,
      height / 2,
      0
    )
  );

  // Roof
  group.add(
    createBox(
      width + 0.6,
      0.5,
      depth + 0.6,
      materials.roof,
      0,
      height + 0.25,
      0
    )
  );

  // Rooftop structures
  const rooftopCount = 4;
  const rooftopSpacing = width / rooftopCount;

  for (let i = 0; i < rooftopCount; i++) {
    const x =
      -width / 2 + rooftopSpacing * (i + 0.5);

    group.add(
      createBox(
        4.5,
        1.2,
        depth * 0.3,
        materials.wall,
        x,
        height + 1.1,
        0
      )
    );
  }

  // Windows and balconies
  const windowsPerFloor = Math.max(
    2,
    Math.floor(width / 3)
  );

  const spacing = width / windowsPerFloor;

  for (let floor = 0; floor < floors; floor++) {
    const y = floor * floorHeight + 1.6;

    for (
      let window = 0;
      window < windowsPerFloor;
      window++
    ) {
      const x =
        -width / 2 + spacing * (window + 0.5);

      // Front window
      group.add(
        createBox(
          1.6,
          1.5,
          0.08,
          materials.window,
          x,
          y,
          depth / 2 + 0.04
        )
      );

      // Rear window
      group.add(
        createBox(
          1.6,
          1.5,
          0.08,
          materials.window,
          x,
          y,
          -depth / 2 - 0.04
        )
      );

      // Balcony floor
      group.add(
        createBox(
          2.2,
          0.2,
          1.4,
          materials.balcony,
          x,
          y - 0.9,
          depth / 2 + 0.7
        )
      );

      // Front balcony railing
      group.add(
        createBox(
          2.2,
          0.65,
          0.08,
          materials.railing,
          x,
          y - 0.48,
          depth / 2 + 1.35
        )
      );

      // Left balcony railing
      group.add(
        createBox(
          0.08,
          0.65,
          1.4,
          materials.railing,
          x - 1.06,
          y - 0.48,
          depth / 2 + 0.7
        )
      );

      // Right balcony railing
      group.add(
        createBox(
          0.08,
          0.65,
          1.4,
          materials.railing,
          x + 1.06,
          y - 0.48,
          depth / 2 + 0.7
        )
      );
    }
  }

  // Side windows
  for (let floor = 0; floor < floors; floor++) {
    const y = floor * floorHeight + 1.6;

    for (const side of [-1, 1]) {
      for (const z of [-depth / 4, depth / 4]) {
        group.add(
          createBox(
            0.08,
            1.5,
            1.6,
            materials.window,
            side * (width / 2 + 0.04),
            y,
            z
          )
        );
      }
    }
  }

  // Our balcony marker
  if (isHome) {
    group.add(
      createBox(
        2.2,
        0.65,
        0.12,
        materials.home,
        -width / 2 + spacing * 2.5,
        4.12,
        depth / 2 + 1.42
      )
    );
  }

  // Position building on the map
  group.position.set(config.x, 0, config.z);

  return group;
}

export function createBuildings(
  scene: THREE.Scene
): void {
  const buildings: BuildingConfig[] = [
    // Our residential building
    {
      x: 0,
      z: 8,
      width: 70,
      depth: 12,
      floors: 3,
      isHome: true
    },

    // Building across the street
    {
      x: 0,
      z: -30,
      width: 70,
      depth: 12,
      floors: 3
    }
  ];

  buildings.forEach(config => {
    scene.add(createBuilding(config));
  });
}