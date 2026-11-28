import * as THREE from 'three';
import { Car } from '../../../models/car';
import { parkingZones } from '../../../config/parking-layout';

export function createVehicleLogos(
    cars: Car[]
): THREE.Group {
    const group = new THREE.Group();
    group.name = 'vehicle-logos';

    const textureLoader = new THREE.TextureLoader();

    parkingZones.forEach(zone => {
        const parkedCars = cars.filter(
            car =>
                car.parking_slot === zone.id &&
                car.brand_logo_url
        );

        if (parkedCars.length === 0) return;

        const padding = 0.3;
        const availableWidth = zone.width - padding * 2;
        const availableDepth = zone.depth - padding * 2;

        const sectionWidth =
            availableWidth / parkedCars.length;

        parkedCars.forEach((car, index) => {
            const texture = textureLoader.load(
                car.brand_logo_url!
            );

            texture.colorSpace = THREE.SRGBColorSpace;

            // White background
            const background = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    sectionWidth - 0.1,
                    availableDepth
                ),
                new THREE.MeshBasicMaterial({
                    color: '#ffffff'
                })
            );

            const x =
                zone.x -
                availableWidth / 2 +
                sectionWidth * (index + 0.5);

            background.rotation.x = -Math.PI / 2;

            background.position.set(
                x,
                0.27,
                zone.z
            );

            group.add(background);

            // Vehicle logo
            const logoSize = Math.min(
                sectionWidth - 0.3,
                availableDepth - 0.3
            );

            const logo = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    logoSize,
                    logoSize
                ),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    toneMapped: false
                })
            );

            logo.rotation.x = -Math.PI / 2;

            logo.position.set(
                x,
                0.29,
                zone.z
            );

            group.add(logo);
        });
    });

    return group;
}

export function disposeVehicleLogos(
    group: THREE.Group
): void {
    group.traverse(object => {
        if (object instanceof THREE.Mesh) {
            object.geometry.dispose();

            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach(material => {
                if (material instanceof THREE.MeshBasicMaterial) {
                    material.map?.dispose();
                }

                material.dispose();
            });
        }
    });

    group.clear();
}