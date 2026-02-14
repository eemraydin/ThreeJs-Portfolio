import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Direct links (no modal)
const directLinks = {
  Scene: "https://www.example.com",
};

// Model content for the modal

const modelContent = {
  Advertise: {
    title: "Advertisement",
    content: "This is Advertise",
    link: "https://www.behance.net/emreaydn37",
  },
  Project_1: {
    title: "Project One",
    content: "This is Project one",
    link: "https://www.behance.net/emreaydn37",
  },
  Project_2: {
    title: "Project Two",
    content: "This is Project two",
    link: "https://www.behance.net/emreaydn37",
  },
  Shoes: {
    title: "About Me",
    content:
      "I am a Full stack Developer and 3D designer with a passion for creating immersive and visually stunning experiences. With a background in Software Engineering, I specialize in crafting detailed 3D models, animations, and interactive environments. My work is driven by a desire to push the boundaries of creativity and innovation, blending vision with technical expertise to bring ideas to life in the digital realm.",
  },
};

const modelTitle = document.querySelector(".modal-title");
const modelDescription = document.querySelector(".modal-project-description");
const modelVisitButton = document.querySelector(".modal-project-visit-button");
const modelExitButton = document.querySelector(".modal-exit-button");

function openModal(model) {
  const content = modelContent[model];

  // Check if content exists for this model
  if (!content) {
    console.log("No content defined for:", model);
    return;
  }

  modelTitle.textContent = content.title;
  modelDescription.textContent = content.content;
  document.querySelector(".modal").classList.remove("hidden");

  if (content.link) {
    modelVisitButton.style.display = "flex";
    modelVisitButton.onclick = () => {
      window.open(content.link, "_blank");
    };
  } else {
    modelVisitButton.style.display = "none";
  }
}
modelExitButton.addEventListener("click", () => {
  document.querySelector(".modal").classList.add("hidden");
});

// Model ends

let intersectObject = null;
const intersectObjects = [];
const intersectObjectsNames = [
  "Advertise",
  "Project_1",
  "Project_2",
  "Text002",
  "Shoes",
];

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
let character = {
  instance: null,
  moveDistance: 10,
  jumpHeight: 2.5,
  isMoving: false,
  moveDuration: 0.2,
};

loader.load(
  "./PortfolioBlender.glb",
  function (glb) {
    glb.scene.traverse(function (child) {
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
      }

      if (child.name === "Shoes") {
        character.instance = child;
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
sun.target.position.set(-150, -200, 250);
sun.shadow.camera.left = -450;
sun.shadow.camera.right = 450;
sun.shadow.camera.top = 450;
sun.shadow.camera.bottom = -450;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.normalBias = 0.6;
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

function onClick() {
  if (intersectObject !== null) {
    // Check if it's a direct link first
    if (directLinks[intersectObject]) {
      document.body.style.cursor = "pointer";
      window.open(directLinks[intersectObject], "_blank");
    } else {
      openModal(intersectObject);
    }
  }
}

function normalizeRotation(targetRotation, currentRotation) {
  // Normalize target rotation to be within PI of current rotation
  let diff = targetRotation - currentRotation;

  while (diff > Math.PI) {
    diff -= 2 * Math.PI;
  }
  while (diff < -Math.PI) {
    diff += 2 * Math.PI;
  }

  return currentRotation + diff;
}

function moveCharacter(targetPosition, targetRotation) {
  character.isMoving = true;
  const normalizedRotation = normalizeRotation(
    targetRotation,
    character.instance.rotation.y,
  );

  const t1 = gsap.timeline({
    onComplete: () => {
      character.isMoving = false;
    },
  });

  t1.to(character.instance.position, {
    x: targetPosition.x,
    z: targetPosition.z,
    duration: character.moveDuration,
  });
  t1.to(
    character.instance.rotation,
    {
      y: normalizedRotation,
      duration: character.moveDuration,
    },
    0,
  );

  t1.to(
    character.instance.position,
    {
      y: character.instance.position.y + character.jumpHeight,

      duration: character.moveDuration / 2,
      yoyo: true,
      repeat: 1,
    },
    0,
  );
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    document.querySelector(".modal").classList.add("hidden");
  }

  if (character.isMoving) return; // Prevent new movement if already moving

  const targetPosition = new THREE.Vector3().copy(character.instance.position);
  let targetRotation = character.instance.rotation.y;

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      targetPosition.x += character.moveDistance;
      targetRotation = -Math.PI / 2; // Face forward
      break;
    case "s":
    case "arrowdown":
      targetPosition.x -= character.moveDistance;
      targetRotation = Math.PI / 2; // Face backward
      break;
    case "a":
    case "arrowleft":
      targetPosition.z -= character.moveDistance;
      targetRotation = 0; // Face left
      break;
    case "d":
    case "arrowright":
      targetPosition.z += character.moveDistance;
      targetRotation = Math.PI; // Face right
      break;
    default:
      return; // Exit if it's not a key we're interested in
  }
  moveCharacter(targetPosition, targetRotation);
}

window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("resize", handleResize);
window.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyDown);

function animate() {
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(intersectObjects);

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
    intersectObject = null;
  }

  for (let i = 0; i < intersects.length; i++) {
    intersectObject = intersects[0].object.parent.name;
  }

  renderer.render(scene, camera);
  controls.update();
}
renderer.setAnimationLoop(animate);
