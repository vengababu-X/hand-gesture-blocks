const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({ video:true })
.then(stream => video.srcObject = stream);

// THREE.JS SCENE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// MediaPipe Hands
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if(results.multiHandLandmarks.length > 0){
    const finger = results.multiHandLandmarks[0][8]; // index finger tip
    cube.position.x = (finger.x - 0.5) * 6;
    cube.position.y = (0.5 - finger.y) * 6;
  }
});

// Camera feed to AI
const cameraFeed = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});
cameraFeed.start();

// Render loop
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
