import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";
const scene=new THREE.Scene();scene.background=new THREE.Color(0x01040a);scene.fog=new THREE.FogExp2(0x02060c,.009);
const cam=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.02,500),ren=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setSize(innerWidth,innerHeight);ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.15;document.body.prepend(ren.domElement);
scene.add(new THREE.HemisphereLight(0x8abce4,0x06101a,2));let sun=new THREE.DirectionalLight(0xffddb0,4);sun.position.set(10,8,5);scene.add(sun);
let stars=[];for(let i=0;i<2600;i++){let r=70+Math.random()*150,u=Math.random()*2-1,p=Math.random()*6.283,q=Math.sqrt(1-u*u);stars.push(r*q*Math.cos(p),r*u,r*q*Math.sin(p))}let sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xc8e0ef,size:.12})));
let planet=new THREE.Mesh(new THREE.SphereGeometry(13,48,32),new THREE.MeshStandardMaterial({color:0x124567,roughness:.7,emissive:0x03111b}));planet.position.set(-17,-15,-38);scene.add(planet);
const rig=new THREE.Group();rig.position.set(0,0,16);scene.add(rig);rig.add(cam);
function box(parent,x,y,z,sx,sy,sz,c,em=0){let m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:c,metalness:.5,roughness:.4,emissive:c,emissiveIntensity:em}));m.position.set(x,y,z);parent.add(m);return m}
box(rig,0,-.72,-1.5,1.7,.08,.18,0x263b4a);box(rig,-.9,-.55,-1.3,.07,.07,2.2,0x263b4a);box(rig,.9,-.55,-1.3,.07,.07,2.2,0x263b4a);
const station=new THREE.Group();station.position.set(0,1,-45);scene.add(station);box(station,0,0,0,9,4,5,0x172735);box(station,0,3,0,7,2,4,0x174437,.1);for(let x=-2.6;x<=2.6;x+=1.3)box(station,x,3.1,-2.05,.85,1.35,.08,0x4b8f78,.18);box(station,0,-.2,2.6,3.3,2.2,.35,0x334754);box(station,0,-.2,2.83,2.45,1.5,.08,0x010407);
const interior=new THREE.Group();station.add(interior);
function corridor(z,len,w=3,h=2.5){let c=0x202c35;box(interior,-w/2,0,z,.14,h,len,c);box(interior,w/2,0,z,.14,h,len,c);box(interior,0,h/2,z,w,.14,len,c);box(interior,0,-h/2,z,w,.14,len,c);for(let q=z-len/2+.6;q<z+len/2;q+=1.4){box(interior,-w/2+.1,.9,q,.04,.15,.3,0x5a9fc2,1);box(interior,w/2-.1,.9,q,.04,.15,.3,0x5a9fc2,1)}}corridor(-5,9);corridor(-13,7,2.5,2.3);
let fan=new THREE.Group();fan.position.set(0,0,-10);interior.add(fan);for(let i=0;i<4;i++){let b=box(fan,0,0,0,2,.16,.12,0x596874);b.rotation.z=i*1.57}
let core=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,1.8,16),new THREE.MeshStandardMaterial({color:0x8a6b34,emissive:0xd09a3c,emissiveIntensity:.25,metalness:.5}));core.rotation.z=1.57;core.position.set(0,0,-17);interior.add(core);
let gates=[];for(let i=0;i<7;i++){let g=new THREE.Mesh(new THREE.TorusGeometry(1.2,.035,8,40),new THREE.MeshBasicMaterial({color:0x5fbde6,transparent:true,opacity:.6}));g.position.set(Math.sin(i*.7)*2,Math.cos(i*.45)*1.2,8-i*6.2);scene.add(g);gates.push(g)}
let keys={},vel=new THREE.Vector3(),started=false,stage=0,gate=0,hull=100,done=false,inside=false,paused=false,clock=new THREE.Clock(),msg=document.querySelector("#msg"),title=document.querySelector("#title"),desc=document.querySelector("#desc"),stats=document.querySelector("#stats");
// Ship radius and station-local solids [xmin,xmax,ymin,ymax,zmin,zmax]: hull, roof, dock frame, tunnel shells (the rear one includes the core).
const R=.25,SOLIDS=[[-4.5,4.5,-2,2,-2.5,2.5],[-3.5,3.5,2,4,-2.1,2],[-1.65,1.65,-1.3,.9,2.5,2.9],[-1.57,1.57,-1.32,1.32,-9.5,-.5],[-1.32,1.32,-1.22,1.22,-17.7,-9.5]];
const CORE=new THREE.Vector3(0,0,-17),AX=new THREE.Vector3(1,0,0),AY=new THREE.Vector3(0,1,0),AZ=new THREE.Vector3(0,0,1),dq=new THREE.Quaternion(),acc=new THREE.Vector3(),local=new THREE.Vector3();
function say(s){msg.textContent=s;clearTimeout(say.t);say.t=setTimeout(()=>msg.textContent="",2200)}function objective(a,b){title.textContent=a;desc.textContent=b}
// Rotations compose on the ship's own axes, so pitch and yaw stay relative to the cockpit after rolling.
function turn(axis,a){rig.quaternion.multiply(dq.setFromAxisAngle(axis,a))}
function lock(){Promise.resolve(ren.domElement.requestPointerLock()).catch(()=>{})}
document.querySelector("#launch").onclick=()=>{document.querySelector("#intro").style.display="none";started=true;lock();objective("잎새 온실 접근","청색 Intercept Gate를 통과해 정거장으로 접근하세요.");say("AUTOPILOT DISENGAGED · MANUAL FLIGHT")};
ren.domElement.onclick=()=>{if(!started)return;if(paused)pause(false);lock()};
// Losing pointer lock (ESC or switching windows) pauses the flight instead of letting the ship drift into the station.
function pause(on){paused=on;keys={};clearTimeout(say.t);msg.textContent=on?"PAUSED · 클릭하면 비행을 계속합니다":""}
document.addEventListener("pointerlockchange",()=>{if(started&&!done&&!paused&&document.pointerLockElement!==ren.domElement)pause(true)});addEventListener("keydown",e=>{keys[e.code]=1;if(e.code==="KeyR"&&done)location.reload()});addEventListener("keyup",e=>keys[e.code]=0);addEventListener("blur",()=>keys={});addEventListener("mousemove",e=>{if(started&&!done&&document.pointerLockElement===ren.domElement){turn(AY,-e.movementX*.0016);turn(AX,-e.movementY*.0016)}});
// Collision helpers work in station-local coordinates and return the impact speed into the surface.
function damage(v){if(v<.5)return;hull=Math.max(0,hull-v*v*.8);if(v>1.2)say("HULL IMPACT · "+v.toFixed(1)+" m/s")}
function clampAxis(k,lo,hi){let d=local[k]<lo?-1:local[k]>hi?1:0;if(!d)return 0;local[k]=d<0?lo:hi;let into=vel[k]*d;if(into>0)vel[k]=-into*.25*d;return Math.max(0,into)}
function solid(b){let best=Infinity,k,lim,n;for(let i=0;i<3;i++){let a="xyz"[i],lo=b[2*i]-R,hi=b[2*i+1]+R,v=local[a];if(v<=lo||v>=hi)return 0;if(v-lo<best){best=v-lo;k=a;lim=lo;n=-1}if(hi-v<best){best=hi-v;k=a;lim=hi;n=1}}local[k]=lim;let into=-vel[k]*n;if(into>0)vel[k]=into*.25*n;return Math.max(0,into)}
function fanHit(){let dz=local.z+10,t=.06+R;if(Math.abs(dz)>=t)return 0;for(let i=0;i<2;i++){let a=fan.rotation.z+i*Math.PI/2,c=Math.cos(a),s=Math.sin(a);if(Math.abs(local.x*c+local.y*s)<1+R&&Math.abs(local.y*c-local.x*s)<.08+R){let n=dz>=0?1:-1,v=Math.max(1.2,-vel.z*n);local.z=-10+n*t;vel.z=n*v*.4;return v}}return 0}
function loop(){requestAnimationFrame(loop);let dt=Math.min(clock.getDelta(),.035);fan.rotation.z+=dt*1.6;planet.rotation.y+=dt*.02;if(started&&!done&&!paused){if(keys.KeyQ)turn(AZ,dt*1.4);if(keys.KeyE)turn(AZ,-dt*1.4);acc.set((keys.KeyD?1:0)-(keys.KeyA?1:0),0,(keys.KeyS?1:0)-(keys.KeyW?1:0)).applyQuaternion(rig.quaternion);vel.addScaledVector(acc,(keys.ShiftLeft||keys.ShiftRight?9:4.2)*dt);if(keys.Space)vel.multiplyScalar(Math.pow(.08,dt));vel.multiplyScalar(Math.pow(.985,dt*60));rig.position.addScaledVector(vel,dt);
if(gate<gates.length&&rig.position.distanceTo(gates[gate].position)<1.8){gates[gate].material.color.set(0x78e3a5);gate++;say("INTERCEPT GATE "+gate+"/"+gates.length)}
station.worldToLocal(local.copy(rig.position));
if(stage===0&&gate>=5){stage=1;objective("MANUAL APPROACH","DOCK 03으로 감속 접근하십시오. 충돌 속도에 주의.");say("RENDEZVOUS WINDOW ACQUIRED")}
if(!inside&&stage>=1&&local.z>1.8&&local.z<=3.2&&Math.abs(local.x)<1.3&&Math.abs(local.y+.2)<.9&&vel.length()<5){inside=true;if(stage===1){stage=2;objective("서비스 터널 진입","도킹 베이를 지나 내부 서비스 터널로 진입하십시오.");say("DOCK 03 · CLEAR TO ENTER")}}
if(inside&&local.z>3.2)inside=false;
if(inside&&stage===2&&local.z<-8.5){stage=3;objective("회전 환풍구 통과","ROLL과 STRAFE를 사용해 서비스 팬을 통과하십시오.");say("POWER OFFLINE · EMERGENCY ROUTE")}
if(inside&&stage===3&&local.z<-15.2){stage=4;objective("냉각 펌프 전달","중앙 전력 코어에 접근해 배송을 완료하십시오.");say("CARGO RELEASE ARMED")}
if(inside&&stage===4&&local.distanceTo(CORE)<1.5){done=true;vel.set(0,0,0);core.material.emissiveIntensity=2.2;station.children.forEach(x=>{if(x.material&&x.material.emissive)x.material.emissiveIntensity=Math.max(x.material.emissiveIntensity,.5)});objective("MISSION COMPLETE","잎새 온실의 냉각계통이 복구되었습니다. R 키로 다시 비행할 수 있습니다.");say("GREENHOUSE POWER RESTORED · DELIVERY CONFIRMED")}
if(!done){let narrow=local.z<-9.5,impact=inside?Math.max(clampAxis("x",-(narrow?1.25:1.5)+R,(narrow?1.25:1.5)-R),clampAxis("y",-(narrow?1.15:1.25)+R,(narrow?1.15:1.25)-R),clampAxis("z",-17.6,Infinity),fanHit()):Math.max(0,...SOLIDS.map(solid));rig.position.copy(station.localToWorld(local));damage(impact)}
stats.innerHTML=`SPEED&nbsp;&nbsp; ${vel.length().toFixed(1)} m/s<br>RANGE&nbsp;&nbsp; ${Math.max(0,rig.position.distanceTo(station.position)-3).toFixed(1)} m<br>HULL&nbsp;&nbsp;&nbsp; ${hull.toFixed(0)}%<br>CARGO&nbsp;&nbsp; COOLANT PUMP`;if(hull<=0){done=true;objective("SHIP DISABLED","선체 손상이 심각합니다. R 키를 눌러 다시 출항하십시오.");say("POSTAL FLIGHT 07 LOST")}}
ren.render(scene,cam)}loop();addEventListener("resize",()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();ren.setSize(innerWidth,innerHeight)});
