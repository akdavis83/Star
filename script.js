const particleCount = 100000;
const radius = 400;
const positionProps = ['x', 'y', 'z'];
const colorProps = ['r', 'g', 'b'];
const ageProps = ['age', 'life'];

let scene;
let camera;
let renderer;
let time;
let sphereGeom;
let sphereMat;
let sphere;
let pointsGeom;
let pointsMat;
let points;
let positions;
let colors;
let ages;
let controls;

addEventListener('DOMContentLoaded', start);
addEventListener('resize', resize);

function start() {
  time = 0;
  scene = new THREE.Scene();
  createCamera();
  createParticles();
  createPoints();
  createSphere();
  createRenderer();
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  render();
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
  50,
  innerWidth / innerHeight,
  1,
  10000);

  camera.position.z = 1600;
}

function createParticles() {
  positions = new PropsArray(particleCount, positionProps);
  colors = new PropsArray(particleCount, colorProps);
  ages = new PropsArray(particleCount, ageProps);

  for (let i = 0; i < particleCount; i++) {
    resetParticle(i);
  }
}

function resetParticle(i) {
  positions.set(setPosition(), i * positions.spread);
  colors.set(setColor(), i * colors.spread);
  ages.set(setAge(), i * ages.spread);
}

function setPosition() {
  let r, p, t, x, y, z;

  r = radius + rand(10);

  t = rand(TAU);
  z = randRange(1);
  p = sqrt(1 - z * z);
  x = r * p * cos(t);
  y = r * p * sin(t);

  z *= r;

  return [x, y, z];
}

function setAge() {
  let age, life;

  age = 0;
  life = 50 + rand(100);

  return [age, life];
}

function setColor() {
  let r, g, b;

  r = fadeIn(60 + rand(100), 360);
  g = fadeIn(80 + rand(60), 360);
  b = fadeIn(180 + rand(60), 360);

  return [r, g, b];
}

function createPoints() {
  const uniforms = {
    u_time: {
      type: 'f',
      value: 0. },

    u_texture: {
      type: 'sampler2D',
      value: new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/544318/particle-texture-2.png') } };



  pointsMat = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('cnoise').textContent +
    document.getElementById('noise-util').textContent +
    document.getElementById('points-vert').textContent,
    fragmentShader: document.getElementById('points-frag').textContent,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    uniforms });


  pointsGeom = new THREE.BufferGeometry();

  pointsGeom.setAttribute(
  'position',
  new THREE.BufferAttribute(positions.values, positions.spread));

  pointsGeom.setAttribute(
  'color',
  new THREE.BufferAttribute(colors.values, colors.spread));

  pointsGeom.setAttribute(
  'age',
  new THREE.BufferAttribute(ages.values, ages.spread));


  points = new THREE.Points(pointsGeom, pointsMat);

  scene.add(points);
}

function createSphere() {
  const uniforms = {
    u_time: {
      type: 'f',
      value: 0. } };



  sphereMat = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('cnoise').textContent +
    document.getElementById('noise-util').textContent +
    document.getElementById('sphere-vert').textContent,
    fragmentShader: document.getElementById('sphere-frag').textContent,
    uniforms });


  sphereGeom = new THREE.IcosahedronBufferGeometry(radius, 6);

  sphere = new THREE.Mesh(sphereGeom, sphereMat);

  scene.add(sphere);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById('canvas') });


  resize();
}

function updateParticles() {
  let i, age, life;

  for (i = 0; i < particleCount; i++) {
    [age, life] = ages.get(i * ages.spread);

    if (age > life) {
      resetParticle(i);
    } else {
      ages.set([++age], i * ages.spread);
    }
  }

  pointsGeom.attributes.position.needsUpdate = true;
  pointsGeom.attributes.color.needsUpdate = true;
  pointsGeom.attributes.age.needsUpdate = true;
}

function render() {
  requestAnimationFrame(render);

  updateParticles();

  time++;

  pointsMat.uniforms.u_time.value = time;
  sphereMat.uniforms.u_time.value = time;
  points.rotation.y += .0025;
  sphere.rotation.y += .0025;

  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
}