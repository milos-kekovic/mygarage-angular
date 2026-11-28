import * as THREE from 'three';

export function createRoads(scene: THREE.Scene): void {
  const group = new THREE.Group();

  const materials = {
    asphalt: new THREE.MeshStandardMaterial({
      color: '#505963',
      roughness: 0.95
    }),

    sidewalk: new THREE.MeshStandardMaterial({
      color: '#c4c6c1',
      roughness: 0.9
    }),

    curb: new THREE.MeshStandardMaterial({
      color: '#e2e4df',
      roughness: 0.8
    })
  };

  function createSurface(
    width: number,
    depth: number,
    x: number,
    z: number,
    material: THREE.Material,
    height = 0.08
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, height / 2, z);
    mesh.receiveShadow = true;

    group.add(mesh);

    return mesh;
  }

  // ==========================
  // ŠVABIĆEVA ULICA
  // ==========================

  createSurface(
    90, 6,
    0, -5,
    materials.asphalt
  );

  // Sidewalks
  for (const z of [-8.8, -1.2]) {
    createSurface(
      90, 1.6,
      0, z,
      materials.sidewalk,
      0.18
    );
  }

  // Curbs
  for (const z of [-8.05, -1.95]) {
    createSurface(
      90, 0.18,
      0, z,
      materials.curb,
      0.22
    );
  }

  // ==========================
  // ZIHERLOVA ULICA
  // ==========================

  createSurface(
    88, 6,
    0, 36,
    materials.asphalt
  );

  // Sidewalk
  createSurface(
    88, 1.8,
    0, 32.1,
    materials.sidewalk,
    0.18
  );

  // Curb
  createSurface(
    88, 0.18,
    0, 32.95,
    materials.curb,
    0.22
  );

  // ==========================
  // KARUNOVA ULICA
  // ==========================

  createSurface(
    7, 80,
    -46, 0,
    materials.asphalt
  );

  // Sidewalk
  createSurface(
    1.6, 80,
    -41.7, 0,
    materials.sidewalk,
    0.18
  );

  // Curb
  createSurface(
    0.18, 80,
    -42.45, 0,
    materials.curb,
    0.22
  );

  // ==========================
  // CURVED ROAD CONNECTION
  // ==========================

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(40, 0, 36),
    new THREE.Vector3(47, 0, 36),
    new THREE.Vector3(47, 0, 20)
  );

  const vertices: number[] = [];
  const indices: number[] = [];

  const segments = 40;
  const halfWidth = 3;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);

    const normal = new THREE.Vector3(
      -tangent.z,
      0,
      tangent.x
    ).normalize();

    const left = point.clone().addScaledVector(
      normal,
      halfWidth
    );

    const right = point.clone().addScaledVector(
      normal,
      -halfWidth
    );

    vertices.push(
      left.x, 0.09, left.z,
      right.x, 0.09, right.z
    );

    if (i < segments) {
      const index = i * 2;

      indices.push(
        index,
        index + 2,
        index + 1,

        index + 1,
        index + 2,
        index + 3
      );
    }
  }

  const curveGeometry = new THREE.BufferGeometry();

  curveGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  curveGeometry.setIndex(indices);
  curveGeometry.computeVertexNormals();

  const curvedRoad = new THREE.Mesh(
    curveGeometry,
    materials.asphalt
  );

  curvedRoad.receiveShadow = true;

  group.add(curvedRoad);

  scene.add(group);
}