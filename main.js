import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Capsule } from "three/addons/math/Capsule.js";
import { Octree } from "three/addons/math/Octree.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Initial white background
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
  Character: {
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

// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem("theme") || "light-theme";
document.body.classList.add(savedTheme);

// Set initial icon and scene based on saved theme
const isInitiallyDark = savedTheme === "dark-theme";
if (isInitiallyDark) {
  darkModeToggle.textContent = "☀️";
  scene.background = new THREE.Color(0x1a1a1a);
} else {
  darkModeToggle.textContent = "🌙";
  scene.background = new THREE.Color(0xffffff);
}

// Connect button to toggleTheme function
darkModeToggle.addEventListener("click", () => {
  // Toggle classes FIRST before animations
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
  
  // Now call toggleTheme which will see the new state
  toggleTheme();
  
  // Save theme preference
  const currentTheme = document.body.classList.contains("dark-theme") 
    ? "dark-theme" 
    : "light-theme";
  localStorage.setItem("theme", currentTheme);
  
  // Update scene background
  const isDark = currentTheme === "dark-theme";
  scene.background = new THREE.Color(isDark ? 0x1a1a1a : 0xffffff);
});

function toggleTheme() {
  // Play sound if available
  if (typeof isMuted !== 'undefined' && !isMuted && typeof playSound === 'function') {
    playSound("projectsSFX");
  }
  
  const isDarkTheme = document.body.classList.contains("dark-theme");

  // Toggle emoji icon
  darkModeToggle.textContent = isDarkTheme ? "☀️" : "🌙";

  gsap.to(light.color, {
    r: isDarkTheme ? 1.0 : 0.25,
    g: isDarkTheme ? 1.0 : 0.31,
    b: isDarkTheme ? 1.0 : 0.78,
    duration: 1,
    ease: "power2.inOut",
  });

  gsap.to(light, {
    intensity: isDarkTheme ? 0.8 : 0.9,
    duration: 1,
    ease: "power2.inOut",
  });

  gsap.to(sun, {
    intensity: isDarkTheme ? 1 : 0.8,
    duration: 1,
    ease: "power2.inOut",
  });

  gsap.to(sun.color, {
    r: isDarkTheme ? 1.0 : 0.25,
    g: isDarkTheme ? 1.0 : 0.41,
    b: isDarkTheme ? 1.0 : 0.88,
    duration: 1,
    ease: "power2.inOut",
  });
}
// Loading the model and setting up the scene
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.querySelector(".loading-text");

const manager = new THREE.LoadingManager();

manager.onLoad = function () {
  const t1 = gsap.timeline();

  t1.to(loadingText, {
    opacity: 0,
    duration: 1,
  });

  t1.to(
    loadingScreen,
    {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        loadingScreen.style.display = "none";
      },
    },
    "-=0.5",
  );
};

let intersectObject = null;
const intersectObjects = [];
const intersectObjectsNames = [
  "Advertise",
  "Project_1",
  "Project_2",
  "ClickHereText",
  "Character",
];

// Physics and character movement

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

const GRAVITY = 50;
const CAPSULE_RADIUS = 2;
const CAPSULE_HEIGHT = 10;
const JUMP_HEIGHT = 20;
const MOVE_SPEED = 25;

let character = {
  instance: null,
  isMoving: false,
  spawnPosition: new THREE.Vector3(),
};

function respawnCharacter() {
  playerCollider.start
    .copy(character.spawnPosition)
    .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
  playerCollider.end
    .copy(character.spawnPosition)
    .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
  playerVelocity.set(0, 0, 0);
  character.instance.position.copy(character.spawnPosition);
  character.isMoving = false;
  playerVelocity.set(0, 0, 0);
  targetRotation = -Math.PI / 2;
}

const colliderOctree = new Octree();
const playerCollider = new Capsule(
  new THREE.Vector3(0, CAPSULE_RADIUS, 0),
  new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
  CAPSULE_RADIUS,
);

let playerOnGround = false;
let playerVelocity = new THREE.Vector3();
let targetRotation = -Math.PI / 2;

const loader = new GLTFLoader(manager);

loader.load(
  "./portfolioV6.glb",
  function (glb) {
    glb.scene.traverse(function (child) {
      if (intersectObjectsNames.includes(child.name)) {
        intersectObjects.push(child);
      }
      if (child.name === "Character") {
        character.spawnPosition.copy(child.position);
        character.instance = child;
        playerCollider.start
          .copy(child.position)
          .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
        playerCollider.end
          .copy(child.position)
          .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
      }
      if (child.name === "Collider") {
        colliderOctree.fromGraphNode(child);
        child.visible = false;
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
          child.material.color = new THREE.Color("#b4570c");
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

const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.castShadow = true;
sun.position.set(-65, 200, -160);
sun.target.position.set(50, 50, 0);
sun.shadow.camera.left = -450;
sun.shadow.camera.right = 450;
sun.shadow.camera.top = 450;
sun.shadow.camera.bottom = -450;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
sun.shadow.normalBias = 0.5;
scene.add(sun);

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

const cameraOffset = new THREE.Vector3(-280, 390, -300);
camera.zoom = 1;
camera.updateProjectionMatrix();
camera.position.set(-130, 41, -315);

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.update();
// controls.target.set(50, -150, -100); // explicitly set what the camera looks at

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

// function moveCharacter(targetPosition, targetRotation) {
//   character.isMoving = true;
//   const normalizedRotation = normalizeRotation(
//     targetRotation,
//     character.instance.rotation.y,
//   );

//   const t1 = gsap.timeline({
//     onComplete: () => {
//       character.isMoving = false;
//     },
//   });

//   t1.to(character.instance.position, {
//     x: targetPosition.x,
//     z: targetPosition.z,
//     duration: character.moveDuration,
//   });
//   t1.to(
//     character.instance.rotation,
//     {
//       y: normalizedRotation,
//       duration: character.moveDuration,
//     },
//     0,
//   );

//   t1.to(
//     character.instance.position,
//     {
//       y: character.instance.position.y + character.jumpHeight,

//       duration: character.moveDuration / 2,
//       yoyo: true,
//       repeat: 1,
//     },
//     0,
//   );
// }

function playerCollisions() {
  const result = colliderOctree.capsuleIntersect(playerCollider);
  playerOnGround = false;

  if (result) {
    playerOnGround = result.normal.y > 0;
    playerCollider.translate(result.normal.multiplyScalar(result.depth));

    if (playerOnGround) {
      character.isMoving = false;
      playerVelocity.x = 0;
      playerVelocity.z = 0;
    }
  }
}

function updatePlayer() {
  if (!character.instance) return;

  if (!playerOnGround) {
    playerVelocity.y -= GRAVITY * 0.035; // Apply gravity
  }

  if (character.instance.position.y < -50) {
    respawnCharacter();
  }

  playerCollider.translate(playerVelocity.clone().multiplyScalar(0.035)); // Move player
  playerCollisions();

  character.instance.position.copy(playerCollider.start);

  let rotationDiff =
    ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
      3 * Math.PI) %
      (2 * Math.PI)) -
    Math.PI;
  let finalRotation = character.instance.rotation.y + rotationDiff;

  character.instance.rotation.y = THREE.MathUtils.lerp(
    character.instance.rotation.y,
    finalRotation,
    0.2,
  );
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    document.querySelector(".modal").classList.add("hidden");
  }

  if (character.isMoving) return; // Prevent new movement if already moving

  //   const targetPosition = new THREE.Vector3().copy(character.instance.position);
  //   let targetRotation = character.instance.rotation.y;

  if (event.code.toLowerCase() === "keyr") {
    respawnCharacter();
    return;
  }

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      playerVelocity.z += MOVE_SPEED;
      targetRotation = Math.PI; // Face forward
      break;
    case "s":
    case "arrowdown":
      playerVelocity.z -= MOVE_SPEED;
      targetRotation = 0; // Face backward
      break;
    case "a":
    case "arrowleft":
      playerVelocity.x += MOVE_SPEED;
      targetRotation = -Math.PI / 2; // Face left
      break;
    case "d":
    case "arrowright":
      playerVelocity.x -= MOVE_SPEED;
      targetRotation = +Math.PI / 2; // Face right
      break;
    default:
      return; // Exit if it's not a key we're interested in
  }
  playerVelocity.y = JUMP_HEIGHT; // Add jump velocity
  character.isMoving = true;
}

// Mobile controls
const mobileControls = {
  up: document.querySelector(".mobile-control.up-arrow"),
  left: document.querySelector(".mobile-control.left-arrow"),
  right: document.querySelector(".mobile-control.right-arrow"),
  down: document.querySelector(".mobile-control.down-arrow"),
};

const pressedButtons = {
  up: false,
  left: false,
  right: false,
  down: false,
};

function handleJumpAnimation() {
  if (!character.instance || !character.isMoving) return;

  const jumpDuration = 0.5;
  const jumpHeight = 2;

  const t1 = gsap.timeline();

  t1.to(character.instance.scale, {
    x: 1.08,
    y: 0.9,
    z: 1.08,
    duration: jumpDuration * 0.2,
    ease: "power2.out",
  });

  t1.to(character.instance.scale, {
    x: 0.92,
    y: 1.1,
    z: 0.92,
    duration: jumpDuration * 0.3,
    ease: "power2.out",
  });

  t1.to(character.instance.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: jumpDuration * 0.3,
    ease: "power1.inOut",
  });

  t1.to(character.instance.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: jumpDuration * 0.2,
  });
}

function handleContinuousMovement() {
  if (!character.instance) return;

  if (
    Object.values(pressedButtons).some((pressed) => pressed) &&
    !character.isMoving
  ) {
    if (pressedButtons.up) {
      playerVelocity.x += MOVE_SPEED;
      targetRotation = -Math.PI / 2;
    }
    if (pressedButtons.down) {
      playerVelocity.x -= MOVE_SPEED;
      targetRotation = Math.PI / 2;
    }
    if (pressedButtons.left) {
      playerVelocity.z -= MOVE_SPEED;
      targetRotation = 0;
    }
    if (pressedButtons.right) {
      playerVelocity.z += MOVE_SPEED;
      targetRotation = Math.PI;
    }

    playerVelocity.y = JUMP_HEIGHT;
    character.isMoving = true;
    handleJumpAnimation();
  }
}

Object.entries(mobileControls).forEach(([direction, element]) => {
  element.addEventListener("touchstart", (e) => {
//     e.preventDefault();
    pressedButtons[direction] = true;
  });

  element.addEventListener("touchend", (e) => {
    e.preventDefault();
    pressedButtons[direction] = false;
  });

  element.addEventListener("mousedown", (e) => {
    e.preventDefault();
    pressedButtons[direction] = true;
  });

  element.addEventListener("mouseup", (e) => {
    e.preventDefault();
    pressedButtons[direction] = false;
  });

  element.addEventListener("mouseleave", (e) => {
    pressedButtons[direction] = false;
  });

  element.addEventListener("touchcancel", (e) => {
    pressedButtons[direction] = false;
  });
});

window.addEventListener("blur", () => {
  Object.keys(pressedButtons).forEach((key) => {
    pressedButtons[key] = false;
  });
});

window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("resize", handleResize);
window.addEventListener("click", onClick);
window.addEventListener("keydown", onKeyDown);

function animate() {
  updatePlayer();
  handleContinuousMovement();
  if (character.instance) {
    const targetCameraPosition = new THREE.Vector3(
      character.instance.position.x + cameraOffset.x,
      cameraOffset.y,
      character.instance.position.z + cameraOffset.z,
    );
    camera.position.copy(targetCameraPosition);
    camera.lookAt(
      character.instance.position.x,
      camera.position.y - 350,
      character.instance.position.z,
    );
  }

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
  //   controls.update();
}
renderer.setAnimationLoop(animate);
