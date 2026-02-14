import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const intersectObjects = [];
const intersectObjectsNames = ["Shoes", "Advertise", "Project 1", "Project 2"];

const canvas = document.getElementById("experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

const loader = new GLTFLoader();

loader.load(
  "./PortfolioBlender.glb",
  function (glb) {
    glb.scene.traverse(function (child) {
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
      }

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.metalness = 0.5;
        child.material.roughness = 1;

        if (child.material.name === "Dress") {
          child.material.metalness = 0.5;
          child.material.roughness = 0.8;
          child.material.color = new THREE.Color("#fff");
        }
        if (child.material.name === "Shirt") {
          child.material.metalness = 0.5;
          child.material.roughness = 0.8;
          child.material.color = new THREE.Color("#072c6b");
        }

        if (child.material.name === "Rock") {
          child.material.metalness = 0.5;
          child.material.roughness = 0.8;
          child.material.color = new THREE.Color("#252525");
        }

        if (child.material.name === "Roads") {
          child.material.metalness = 0.6;
          child.material.roughness = 2;
          child.material.color = new THREE.Color("#a4880a");
        }
      }
    });
    scene.add(glb.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  },
);

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.castShadow = true;
sun.position.set(-65, 250, -90);
sun.target.position.set(-10, -20, 0);
sun.shadow.camera.left = -350;
sun.shadow.camera.right = 350;
sun.shadow.camera.top = 350;
sun.shadow.camera.bottom = -250;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.normalBias = 0.4;
scene.add(sun);

const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowHelper);
const helper = new THREE.DirectionalLightHelper(sun, 5);
scene.add(helper);
const light = new THREE.AmbientLight(0x404040, 4);
scene.add(light);
const frustumSize = 70;
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  -aspect * frustumSize,
  aspect * frustumSize,
  frustumSize,
  -frustumSize,
  -30,
  1000,
);
scene.add(camera);
camera.position.set(-130, 41, -315);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.update();
controls.target.set(50, -150, -100); // explicitly set what the camera looks at

function handleResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  const aspect = sizes.width / sizes.height;
  camera.left = -aspect * frustumSize; //with frustumSize 250
  camera.right = aspect * frustumSize;
  camera.top = frustumSize;
  camera.bottom = -frustumSize;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
}

function handlePointerMove(event) {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  pointer.set(mouseX, mouseY);
}
window.addEventListener("pointermove", handlePointerMove);

function animate() {
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(intersectObjects);

  for (let i = 0; i < intersects.length; i++) {
    console.log(intersects);
  }

  renderer.render(scene, camera);
  controls.update();
}
renderer.setAnimationLoop(animate);

window.addEventListener("resize", handleResize);
