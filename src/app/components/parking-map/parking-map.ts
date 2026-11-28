import {
  Component,
  ElementRef,
  viewChild,
  input,
  output,
  effect,
  signal,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { createBuildings } from './scene/buildings';
import { createRoads } from './scene/roads';
import { createVegetation } from './scene/vegetation';
import { createParkingZones } from './scene/parking-zones';
import { Car } from '../../models/car';
import {
    createVehicleLogos,
    disposeVehicleLogos
} from './scene/vehicle-logos';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-parking-map',
  imports: [],
  templateUrl: './parking-map.html',
  styleUrl: './parking-map.scss'
})
export class ParkingMap implements AfterViewInit, OnDestroy {

  readonly cars = input.required<Car[]>();
  private readonly sceneReady = signal(false);
  private vehicleLogosGroup: THREE.Group | null = null;
  private readonly mapContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private parkingGroup!: THREE.Group;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private resizeObserver!: ResizeObserver;

  readonly zoneSelected = output<string>();

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();

  private pointerStart: THREE.Vector2 | null = null;

  constructor() {
    effect(() => {
        if (!this.sceneReady()) return;

        const cars = this.cars();

        this.renderVehicleLogos(cars);
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initLights();

    this.createGround();

    createRoads(this.scene);
    createBuildings(this.scene);
    createVegetation(this.scene);

    this.parkingGroup = createParkingZones(this.scene);

    this.observeResize();
    this.animate();
    
    this.sceneReady.set(true);
  }

  private renderVehicleLogos(cars: Car[]): void {
    if (this.vehicleLogosGroup) {
        this.scene.remove(this.vehicleLogosGroup);

        disposeVehicleLogos(this.vehicleLogosGroup);
    }

    this.vehicleLogosGroup = createVehicleLogos(cars);

    this.scene.add(this.vehicleLogosGroup);
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#dce8e7');
  }

  private initCamera(): void {
    this.camera = new THREE.OrthographicCamera(
      -40, 40, 40, -40, 0.1, 1000
    );

    this.camera.position.set(65, 75, 90);
    this.camera.lookAt(0, 0, 0);
  }

  private initRenderer(): void {
    const container = this.mapContainer().nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    this.resize();
  }

  private initControls(): void {
    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    this.controls.minZoom = 0.6;
    this.controls.maxZoom = 4;
    this.controls.maxPolarAngle = Math.PI / 2.2;

    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private initLights(): void {
    const ambientLight = new THREE.HemisphereLight(
      '#ffffff',
      '#81916f',
      2
    );

    this.scene.add(ambientLight);

    const sunlight = new THREE.DirectionalLight(
      '#fff4df',
      3
    );

    sunlight.position.set(-40, 80, 50);
    sunlight.castShadow = true;

    sunlight.shadow.mapSize.set(2048, 2048);

    sunlight.shadow.camera.left = -65;
    sunlight.shadow.camera.right = 65;
    sunlight.shadow.camera.top = 65;
    sunlight.shadow.camera.bottom = -65;

    sunlight.shadow.normalBias = 0.05;

    this.scene.add(sunlight);
  }

  private createGround(): void {
    const geometry = new THREE.BoxGeometry(100, 2, 80);

    const material = new THREE.MeshStandardMaterial({
      color: '#a8c69f',
      roughness: 0.9
    });

    const ground = new THREE.Mesh(geometry, material);

    ground.position.y = -1;
    ground.receiveShadow = true;

    this.scene.add(ground);
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    this.resizeObserver.observe(
      this.mapContainer().nativeElement
    );
  }

  private resize(): void {
    const container = this.mapContainer().nativeElement;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    const aspect = width / height;
    const viewSize = 140;

    const visibleHeight = viewSize / Math.min(aspect, 1);

    this.camera.left = -visibleHeight * aspect / 2;
    this.camera.right = visibleHeight * aspect / 2;
    this.camera.top = visibleHeight / 2;
    this.camera.bottom = -visibleHeight / 2;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private animate(): void {
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  ngOnDestroy(): void {
    this.renderer?.setAnimationLoop(null);

    this.resizeObserver?.disconnect();
    this.controls?.dispose();

    this.scene?.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach(material => {
          if (
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshStandardMaterial
          ) {
            material.map?.dispose();
          }

          material.dispose();
        });
      }

      if (object instanceof THREE.DirectionalLight) {
        object.shadow.dispose();
      }
    });

    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }

  protected onPointerDown(event: PointerEvent): void {
  if (!event.isPrimary || event.button !== 0) return;

  this.pointerStart = new THREE.Vector2(
    event.clientX,
    event.clientY
  );
}

private selectParkingZone(event: PointerEvent): void {
  const rect = this.renderer.domElement.getBoundingClientRect();

  this.pointer.x =
    ((event.clientX - rect.left) / rect.width) * 2 - 1;

  this.pointer.y =
    -((event.clientY - rect.top) / rect.height) * 2 + 1;

  this.raycaster.setFromCamera(
    this.pointer,
    this.camera
  );

  const intersections = this.raycaster.intersectObjects(
    this.scene.children,
    true
  );

  if (intersections.length === 0) return;

  let object: THREE.Object3D | null =
    intersections[0].object;

  while (object) {
    const zoneId = object.userData['zoneId'];

    if (typeof zoneId === 'string') {
      this.zoneSelected.emit(zoneId);
      return;
    }

    object = object.parent;
  }
}

protected onPointerUp(event: PointerEvent): void {
  if (!event.isPrimary || !this.pointerStart) return;

  const distance = this.pointerStart.distanceTo(
    new THREE.Vector2(event.clientX, event.clientY)
  );

  this.pointerStart = null;

  if (distance > 5) return;

  this.selectParkingZone(event);
}

  protected onPointerCancel(): void {
    this.pointerStart = null;
  }
}

