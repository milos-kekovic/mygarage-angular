import * as THREE from 'three';

export function createVegetation(
  scene: THREE.Scene
): void {
  const group = new THREE.Group();

  const materials = {
    trunk: new THREE.MeshStandardMaterial({
      color: '#795548',
      roughness: 1
    }),

    leaves: [
      new THREE.MeshStandardMaterial({
        color: '#3d7046',
        roughness: 0.9
      }),
      new THREE.MeshStandardMaterial({
        color: '#568c4c',
        roughness: 0.9
      }),
      new THREE.MeshStandardMaterial({
        color: '#76a660',
        roughness: 0.9
      })
    ],

    grass: new THREE.MeshStandardMaterial({
      color: '#8eb77b',
      roughness: 1
    }),

    soil: new THREE.MeshStandardMaterial({
      color: '#8b7861',
      roughness: 1
    })
  };

  const trunkGeometry = new THREE.CylinderGeometry(
    0.16, 0.25, 2.4, 8
  );

  const crownGeometry = new THREE.IcosahedronGeometry(
    1, 2
  );

  function createTree(
    x: number,
    z: number,
    scale = 1,
    variant = 0
  ): void {
    const tree = new THREE.Group();

    // Tree trunk
    const trunk = new THREE.Mesh(
      trunkGeometry,
      materials.trunk
    );

    trunk.position.y = 1.2;
    trunk.castShadow = true;

    tree.add(trunk);

    // Main crown
    const crown = new THREE.Mesh(
      crownGeometry,
      materials.leaves[variant % 3]
    );

    crown.position.set(0, 3.2, 0);
    crown.scale.set(1.7, 1.9, 1.6);
    crown.castShadow = true;
    crown.receiveShadow = true;

    tree.add(crown);

    // Smaller crown sections
    const crownParts = [
      { x: -0.9, y: 2.9, z: 0.3 },
      { x: 0.9, y: 3.1, z: -0.2 },
      { x: 0.2, y: 3.6, z: 0.7 }
    ];

    crownParts.forEach((position, index) => {
      const part = new THREE.Mesh(
        crownGeometry,
        materials.leaves[(variant + index + 1) % 3]
      );

      part.position.set(
        position.x,
        position.y,
        position.z
      );

      part.scale.set(1.1, 1.3, 1.1);
      part.castShadow = true;

      tree.add(part);
    });

    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    group.add(tree);
  }

  function createBush(
    x: number,
    z: number,
    scale = 1
  ): void {
    const bush = new THREE.Mesh(
      crownGeometry,
      materials.leaves[0]
    );

    bush.position.set(x, scale * 0.45, z);

    bush.scale.set(
      scale,
      scale * 0.65,
      scale * 0.8
    );

    bush.castShadow = true;
    bush.receiveShadow = true;

    group.add(bush);
  }

  function createLawn(
    x: number,
    z: number,
    width: number,
    depth: number
  ): void {
    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.06, depth),
      materials.grass
    );

    lawn.position.set(x, 0.03, z);
    lawn.receiveShadow = true;

    group.add(lawn);
  }

  // ==========================
  // GREEN AREAS
  // ==========================

  createLawn(0, -17, 74, 14);
  createLawn(0, 20, 74, 8);

  // ==========================
  // TREES IN FRONT OF BUILDING
  // ==========================

  const frontTrees = [
    { x: -34, z: 22, scale: 1.1 },
    { x: -22, z: 21, scale: 0.9 },
    { x: -10, z: 22, scale: 1.2 },
    { x: 2, z: 21, scale: 1 },
    { x: 14, z: 22, scale: 1.1 },
    { x: 26, z: 21, scale: 0.9 },
    { x: 36, z: 22, scale: 1.2 }
  ];

  frontTrees.forEach((tree, index) => {
    createTree(
      tree.x,
      tree.z,
      tree.scale,
      index
    );
  });

  // ==========================
  // TREES BETWEEN BUILDINGS
  // ==========================

  for (let i = 0; i < 7; i++) {
    createTree(
      -33 + i * 11,
      -19,
      0.85 + (i % 3) * 0.15,
      i
    );
  }

  // ==========================
  // TREES ON THE FAR RIGHT
  // ==========================

  createTree(40, -20, 1.2, 0);
  createTree(41, 5, 1.1, 1);
  createTree(40, 16, 1.3, 2);

  // ==========================
  // BUSHES NEAR BUILDINGS
  // ==========================

  for (let i = 0; i < 15; i++) {
    const x = -33 + i * 4.7;

    createBush(x, 16.5, 0.8);
    createBush(x, -22.5, 0.7);
  }

  scene.add(group);
}