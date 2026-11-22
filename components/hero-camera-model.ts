import * as T from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function mountCamera(canvas: HTMLCanvasElement, onFirstRender: () => void) {
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0, 0);
  // Keep the camera engraving crisp on dense phone displays without rendering
  // at the full native pixel ratio, which is costly on mobile GPUs.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene();
  const pmrem = new T.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = .57;
  renderer.toneMappingExposure = .83;
  const camera = new T.OrthographicCamera(-4, 4, 3, -3, .1, 40);
  camera.position.z = 12;
  const body = new T.Group();
  scene.add(body);
  function material(color: number, metalness: number, roughness: number) {
    return new T.MeshStandardMaterial({color, metalness, roughness});
  }
  const silver = material(0x999994, .86, .39);
  const chrome = material(0xd3d4ce, .98, .15);
  const graphite = material(0x262625, .86, .31);
  const leather = material(0x222221, .05, .79);
  const black = material(0x090b0b, .32, .42);
  function texture(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    const sheet = document.createElement("canvas");
    sheet.width = sheet.height = size;
    draw(sheet.getContext("2d")!);
    const result = new T.CanvasTexture(sheet);
    result.colorSpace = T.SRGBColorSpace;
    result.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return result;
  }
  const grain = texture(256, ctx => {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0,0,256,256);
    let seed = 73;
    function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (let i=0; i<6800; i++) {
      ctx.fillStyle = rand()>.48 ? "#a8a8a8" : "#494949";
      ctx.beginPath();
      ctx.ellipse(rand()*256,rand()*256,1+rand()*2,1+rand(),rand()*3,0,Math.PI*2);
      ctx.fill();
    }
  });
  grain.wrapS = grain.wrapT = T.RepeatWrapping;
  grain.repeat.set(3,2);
  leather.bumpMap = grain;
  leather.bumpScale = .021;
  leather.roughnessMap = grain;
  function mesh(geometry: T.BufferGeometry, mat: T.Material, x: number,y: number,z: number) {
    const part = new T.Mesh(geometry,mat);
    part.position.set(x,y,z);
    body.add(part);
    return part;
  }
  function box(w:number,h:number,d:number,r:number,mat:T.Material,x:number,y:number,z:number) {
    return mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,x,y,z);
  }
  function disc(radius:number,depth:number,mat:T.Material,x:number,y:number,z:number,front=true) {
    const part=mesh(new T.CylinderGeometry(radius,radius,depth,80),mat,x,y,z);
    if(front) part.rotation.x=Math.PI/2;
    return part;
  }
  // A stepped die-cast housing rises over the optical finder and slopes down to the dial.
  const profile = new T.Shape();
  profile.moveTo(-2.22,-1.12);
  profile.lineTo(2.16,-1.12);
  profile.quadraticCurveTo(2.32,-1.12,2.32,-.96);
  profile.lineTo(2.32,1.04);
  profile.quadraticCurveTo(2.32,1.17,2.17,1.17);
  profile.lineTo(.99,1.17);
  profile.lineTo(.67,1.31);
  profile.lineTo(-2.14,1.31);
  profile.quadraticCurveTo(-2.31,1.31,-2.31,1.12);
  profile.lineTo(-2.31,-.99);
  profile.closePath();
  mesh(new T.ExtrudeGeometry(profile,{depth:.88,bevelThickness:.06,bevelSize:.045,bevelSegments:3}),silver,0,0,-.44);
  box(4.68,1.80,1.025,.095,leather,0,-.13,0);
  box(4.63,.12,1.01,.045,graphite,0,-1.06,0);
  box(.42,1.42,.20,.09,leather,-1.98,-.13,.49);
  box(.65,.31,.12,.045,graphite,-1.79,1.01,.52);
  const glass = new T.MeshPhysicalMaterial({color:0x142a30,metalness:.14,roughness:.075,clearcoat:1,ior:1.52,iridescence:.22});
  box(.51,.21,.13,.035,glass,-1.79,1.01,.54);
  box(.69,.23,.08,.035,chrome,1.68,1.03,.52);
  box(.61,.19,.04,.025,silver,1.68,1.03,.562);
  const diffuser = material(0xe1dac6,.25,.24);
  const flashMaterial = diffuser.clone();
  flashMaterial.emissive.setHex(0xfff3dd);
  flashMaterial.emissiveIntensity = 0;
  const emitter = box(.59,.14,.018,.015,flashMaterial,1.68,1.03,.584);
  for(let i=0;i<16;i++) box(.012,.166,.03,.004,chrome,1.4+i*.037,1.03,.59);
  for(const [x,r,h] of [[1.52,.34,.14]]) {
    disc(r,h,graphite,x,1.24,0,false);
    disc(r*.97,.035,silver,x,1.24+h/2,0,false);
    if (x > 1) {
      for (let step = 0; step < 12; step++) {
        const angle = step * Math.PI / 6;
        const mark = box(.014,.006,step % 3 === 0 ? .074 : .042,.002,graphite,
          x + .30 * Math.sin(angle),1.262+h/2,.30 * Math.cos(angle));
        mark.rotation.y = angle;
      }
    }
    const teeth = new T.InstancedMesh(new T.BoxGeometry(.023,h*.82,.023),silver,36);
    const tooth = new T.Object3D();
    for(let i=0;i<36;i++) {
      const angle=i*Math.PI/18;
      tooth.position.set(x+r*Math.sin(angle),1.24,r*Math.cos(angle));
      tooth.rotation.y=angle;
      tooth.updateMatrix();
      teeth.setMatrixAt(i,tooth.matrix);
    }
    body.add(teeth);
  }
  disc(.17,.035,graphite,2.04,1.23,.08,false);
  const shutterButton = disc(.14,.07,chrome,2.04,1.25,.08,false);
  // Recessed lens release and rangefinder illumination window.
  disc(.125,.035,silver,-.84,-.46,.54);
  disc(.095,.055,graphite,-.84,-.46,.568);
  box(.26,.15,.025,.025,graphite,-1.24,1.04,.53);
  box(.20,.095,.028,.015,diffuser,-1.24,1.04,.545);
  for (const x of [-2.12, 2.12]) {
    disc(.037,.015,graphite,x,1.10,.525);
    box(.044,.008,.006,.002,black,x,1.10,.535);
  }
  const cx=.38, cy=-.13;
  for(const [radius,z,depth,mat] of [
    [1.077,.55,.16,chrome],[1.037,.67,.18,black],[.98,.81,.17,graphite],[.95,.95,.16,black],[.91,1.06,.09,graphite]
  ] as const) disc(radius,depth,mat,cx,cy,z);
  const ridgeGeometry=new T.BoxGeometry(.023,.027,.145);
  const ridges=new T.InstancedMesh(ridgeGeometry,graphite,150);
  const placement=new T.Object3D();
  for(let i=0;i<150;i++) {
    const angle=i*Math.PI*2/150;
    placement.position.set(cx+.95*Math.cos(angle),cy+.95*Math.sin(angle),.95);
    placement.rotation.z=angle;
    placement.updateMatrix();
    ridges.setMatrixAt(i,placement.matrix);
  }
  body.add(ridges);
  const brushing = texture(128, ctx => {
    for (let row = 0; row < 128; row++) {
      const tone = 190 + Math.round(16 * Math.sin(row * 2.7));
      ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
      ctx.fillRect(0,row,128,1);
    }
  });
  brushing.colorSpace = T.NoColorSpace;
  silver.roughnessMap = brushing;
  const textures:T.Texture[]=[grain, brushing];
  function decal(map:T.Texture,w:number,h:number,x:number,y:number,z:number) {
    textures.push(map);
    mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}),x,y,z);
  }
  let disposed = false;
  const wordmark = new T.TextureLoader().load("/images/ticketstandard-wordmark.png", () => {
    if (!disposed) schedule();
  });
  wordmark.colorSpace = T.SRGBColorSpace;
  wordmark.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  textures.push(wordmark);
  const ink = new T.MeshStandardMaterial({
    map: wordmark, color: 0x151412, roughness: .66, transparent: true, depthWrite: false
  });
  mesh(new T.PlaneGeometry(1.42,1.42/3),ink,0,1.087,.533);
  decal(texture(1024, ctx => {
    ctx.fillStyle = "#b5b1a7";
    ctx.font = "500 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    function arcLabel(label: string, bottom: boolean) {
      const letters = Array.from(label);
      const radius = 457;
      const widths = letters.map(letter => ctx.measureText(letter).width + 4);
      let offset = -widths.reduce((total, width) => total + width, 0) / 2;
      letters.forEach((letter, index) => {
        const angle = (offset + widths[index] / 2) / radius;
        ctx.save();
        ctx.translate(512 + radius * Math.sin(angle), 512 + (bottom ? 1 : -1) * radius * Math.cos(angle));
        ctx.rotate(bottom ? -angle : angle);
        ctx.fillText(letter, 0, 0);
        ctx.restore();
        offset += widths[index];
      });
    }
    arcLabel("ASPHERICAL", false);
    arcLabel("35 mm   f/2   Ø43", true);
  }),1.8,1.8,cx,cy,1.11);
  for(const [r,z] of [[.72,1.114],[.67,1.127],[.615,1.14]]) disc(r,.016,black,cx,cy,z);
  // Stepped retaining rings give the front glass a recessed seat.
  disc(.607,.025,graphite,cx,cy,1.15);
  disc(.59,.026,black,cx,cy,1.162);
  const optic=mesh(new T.SphereGeometry(.58,72,40),glass,cx,cy,1.176);
  optic.scale.z=.115;
  // Let the iris and inner barrel show through the coated front element.
  optic.material = glass.clone();
  optic.material.transparent = true;
  optic.material.opacity = .34;
  optic.material.depthWrite = false;
  const blades = material(0x30393b,.43,.58);
  const apertureLeaves: T.Mesh[] = [];
  const pivotRadius = .405;
  const leafShape = new T.Shape();
  // Local origin is the hinge. Adjacent leaves overlap under the retaining ring.
  leafShape.moveTo(-.20,-.12);
  leafShape.quadraticCurveTo(-.20,.10,-.06,.32);
  leafShape.quadraticCurveTo(.13,.23,.10,.01);
  leafShape.quadraticCurveTo(.08,-.16,-.20,-.12);
  const bladeGeometry = new T.ShapeGeometry(leafShape);
  for (let i = 0; i < 9; i++) {
    const angle = i * Math.PI * 2 / 9;
    const leaf = mesh(bladeGeometry,blades,cx+pivotRadius*Math.cos(angle),
      cy+pivotRadius*Math.sin(angle),1.181+i*.0005);
    leaf.rotation.z = angle;
    apertureLeaves.push(leaf);
  }
  mesh(new T.RingGeometry(.435,.575,80),graphite,cx,cy,1.188);
  mesh(new T.CircleGeometry(.435,80),material(0x060e11,.12,.46),cx,cy,1.177);
  // A soft contact shadow sits flush against the leather around the mount.
  const shadow = texture(128, ctx => {
    const fade = ctx.createRadialGradient(64,64,47,64,64,64);
    fade.addColorStop(0,"rgba(0,0,0,.72)");
    fade.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = fade; ctx.fillRect(0,0,128,128);
  });
  decal(shadow,2.42,2.42,cx+.025,cy-.035,.531);
  const light=new T.DirectionalLight(0xfff4dd,1.34);
  light.position.set(-3,5,6);scene.add(light);
  const frontFill=new T.DirectionalLight(0xe8f0ff,.55);
  frontFill.position.set(2,-1,8);scene.add(frontFill);
  const rim = new T.DirectionalLight(0xd8e6ff, 1.65);
  rim.position.set(4, 3, -2);
  scene.add(rim);
  scene.add(new T.HemisphereLight(0xe7edf4,0x38312a,.55));
  // The diffuser should light the camera briefly, not only glow by itself.
  // Keep the point light on the camera body so it follows the camera turn.
  const flashLight = new T.PointLight(0xffedcf, 0, 5.5, 2);
  flashLight.position.set(1.68, 1.03, .72);
  body.add(flashLight);
  let frame=0;
  let targetX=.115,targetY=-.31,targetZ=-.048;
  let captureFacing=false;
  let onFacing: (() => void) | undefined;
  let holdFrontUntilScrollUp=false;
  let lastScrollY=window.scrollY;
  body.rotation.set(targetX,targetY,targetZ);
  const flashPosition = new T.Vector3();
  const stage = canvas.parentElement;
  let rendered = false;
  let previousFrame = 0;
  let firedAt = -Infinity;
  function render(now: number) {
    const blend = 1 - Math.exp(-12 * Math.min((now - previousFrame) / 1000, .05));
    previousFrame = now;
    frame=0;
    body.rotation.x+=(targetX-body.rotation.x)*blend;
    body.rotation.y+=(targetY-body.rotation.y)*blend;
    body.rotation.z+=(targetZ-body.rotation.z)*blend;
    if (onFacing && firedAt === -Infinity && Math.abs(body.rotation.x) + Math.abs(body.rotation.y) + Math.abs(body.rotation.z) < .003) firedAt = now;
    const elapsed = now - firedAt;
    const ease = T.MathUtils.smoothstep;
    const press = ease(elapsed,0,55) * (1-ease(elapsed,115,230));
    const stopDown = ease(elapsed,20,65) * (1-ease(elapsed,95,190));
    shutterButton.position.y = 1.25 - .035 * press;
    apertureLeaves.forEach((leaf, index) => {
      leaf.rotation.z = index * Math.PI * 2 / 9 - .53 * stopDown;
    });
    flashMaterial.emissiveIntensity = elapsed >= 65 ? 5 * Math.exp(-(elapsed-65)/42) : 0;
    flashLight.intensity = elapsed >= 65 ? 7 * Math.exp(-(elapsed-65)/42) : 0;
    renderer.render(scene,camera);
    if (!rendered) {
      rendered = true;
      onFirstRender();
    }
    emitter.getWorldPosition(flashPosition).project(camera);
    stage?.style.setProperty("--flash-x", ((1+flashPosition.x)*50)+"%");
    stage?.style.setProperty("--flash-y", ((1-flashPosition.y)*50)+"%");
    if (onFacing && Number.isFinite(elapsed) && elapsed >= 65) {
      onFacing();
      onFacing = undefined;
    }
    if(now-firedAt < 260 || Math.abs(targetX-body.rotation.x)+Math.abs(targetY-body.rotation.y)+Math.abs(targetZ-body.rotation.z)>.001) frame=requestAnimationFrame(render);
  }
  function schedule(){if(!frame) frame=requestAnimationFrame(render);}
  function resize(){
    const {clientWidth:w,clientHeight:h}=canvas;
    if(!w || !h)return;
    const aspect=w/h, height=Math.max(3.9,5.85/aspect);
    camera.zoom = .93;
    camera.left=-height*aspect/2;camera.right=-camera.left;
    camera.top=height/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);schedule();
  }
  function point(e:PointerEvent){
    if(e.pointerType!=="mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    if(captureFacing || holdFrontUntilScrollUp)return;
    const b=canvas.getBoundingClientRect();
    const scrollProgress=Math.max(0,Math.min(1,window.scrollY/360));
    targetY=(-.31+((e.clientX-b.left)/b.width-.5)*.55)*(1-scrollProgress);
    targetX=(.115+((e.clientY-b.top)/b.height-.5)*.24)*(1-scrollProgress);
    targetZ=-.048*(1-scrollProgress);schedule();
  }
  function reset(){
    if(captureFacing || holdFrontUntilScrollUp)return;
    const scrollProgress=Math.max(0,Math.min(1,window.scrollY/360));
    targetX=.115*(1-scrollProgress);targetY=-.31*(1-scrollProgress);targetZ=-.048*(1-scrollProgress);schedule();
  }
  function orientToScroll(){
    if(captureFacing || matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const scrollY=window.scrollY;
    if(holdFrontUntilScrollUp){
      if(scrollY>=lastScrollY){lastScrollY=scrollY;return;}
      holdFrontUntilScrollUp=false;
    }
    lastScrollY=scrollY;
    const progress=Math.max(0,Math.min(1,scrollY/360));
    if (targetX === .115*(1-progress) && targetY === -.31*(1-progress) && targetZ === -.048*(1-progress)) return;
    targetX=.115*(1-progress);targetY=-.31*(1-progress);targetZ=-.048*(1-progress);schedule();
  }
  function faceForDemo(event: Event){
    onFacing = (event as CustomEvent<() => void>).detail;
    firedAt = -Infinity;
    captureFacing=true;targetX=0;targetY=0;targetZ=0;schedule();
  }
  function releaseDemoFacing(){
    captureFacing=false;
    onFacing = undefined;
    holdFrontUntilScrollUp=true;
    lastScrollY=window.scrollY;
  }
  canvas.addEventListener("pointermove",point);canvas.addEventListener("pointerleave",reset);
  window.addEventListener("scroll",orientToScroll,{passive:true});
  window.addEventListener("ticketstandard:camera-capture",faceForDemo);
  window.addEventListener("ticketstandard:camera-capture-complete",releaseDemoFacing);
  orientToScroll();
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  return ()=>{
    disposed = true;
    observer.disconnect();cancelAnimationFrame(frame);
    canvas.removeEventListener("pointermove",point);canvas.removeEventListener("pointerleave",reset);
    window.removeEventListener("scroll",orientToScroll);
    window.removeEventListener("ticketstandard:camera-capture",faceForDemo);
    window.removeEventListener("ticketstandard:camera-capture-complete",releaseDemoFacing);
    const materials=new Set<T.Material>();
    body.traverse(p=>{if(p instanceof T.Mesh){p.geometry.dispose();materials.add(p.material);if(p instanceof T.InstancedMesh)p.dispose();}});
    materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();
  };
}

