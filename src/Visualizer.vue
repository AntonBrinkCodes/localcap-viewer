<template>
  <div class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%; height: 100vh;">
    <div class="viewer flex-grow-1" style="min-width: 100px; max-width: 100%; height: 100%;">
      <div id="mocap" ref="mocap"></div>
    </div>
  </div>
</template>


<script>
import * as THREE from 'three';
import * as THREE_OC from '@/orbitControls'
import { getCurrentInstance } from 'vue'



import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

import animationData from './assets/dynamic_2.json'; // Assuming the JSON file is in the assets folder

const objLoader = new OBJLoader();

export default {
  name: 'Vizualiser',
  props: {
    animationJson: Object, // Receive the JSON data as a prop
  },
  data() {
    return {
      /**meshes: {},
      trialLoading: true,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      mixer: null,
      animation_json: null,
      frames: [],
      pose_spheres: [],
      pose_bones: [],
      meshes: {},
      frame: 0,
      time: 0,
      playing: false,
      playSpeed: 1,
      timeStart: 0,
      timeEnd: 0,*/
    };
  },
  watch: {
    // Watch for changes in animationJson prop and initialize when it's available
    animationJson: {
      handler(newValue) {
        if (newValue) {
          this.initializeInstance();
          this.loadAnimationData();
          this.setup3d();
          this.addEnvironment();
        }
      },
      immediate: false,
    },
  },
  mounted() {
    console.log("Mount Visualizer...")
    this.initializeInstance();
    this.loadAnimationData();
    this.$nextTick(() =>{
      //this.initThreeJS();
      const container = this.$refs.mocap;

      if (!container) {
        console.error("Container not found")
        return
      } else{
        console.info("container: ", container)
         // Log container dimensions
         const width = container.clientWidth;
        const height = container.clientHeight;

        console.info("Container Dimensions - Width:", width, "Height:", height);

        if (width === 0 || height === 0) {
            console.warn("Container has zero width or height. Check parent container styles.");
            /* DEBUG CONDITIONS */
            let parent = container.parentElement;
            while (parent) {
            console.info("Parent Dimensions - Width:", parent.clientWidth, "Height:", parent.clientHeight);
            parent = parent.parentElement;
}
        } else {
        this.setup3d();
        this.addEnvironment();
      }
    }
      
  });
  },
  methods: {
    initializeInstance() {
      this.playing = false;
      this.meshes = {};
      this.frame = 0;
      //this.meshes = {};
    },

    loadAnimationData() {
      // Load the JSON file
      //fetch('./assets/dynamic_2.json')
      //.then(response => response.json())
      //then(data => {
        this.animation_json = this.animationJson;
        this.frames = this.animationJson.time;
        this.trialLoading = false;
      //});
      //console.log("loaded data?", this.animation_json);
      console.log("frames", this.frames)
    },
    setup3d() {
      const container = this.$refs.mocap
      console.log("container in setup3d():", container)
      if(!container){
        console.error("For some reason no container in setup3d()")
      } else {
      console.log("clientWidth: ", container.clientWidth)
      console.log("ClientHeight: ", container.clientHeight)
      let ratio = container.clientWidth / container.clientHeight
      this.camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 125)
      this.camera.position.x = 4.5
      this.camera.position.z = -3
      this.camera.position.y = 3

      
      this.scene = new THREE.Scene()
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.shadowMap.enabled = true;
      this.camera.aspect = ratio;
      this.camera.position.set(4.5, 3, -3);
      this.camera.updateProjectionMatrix();
      container.appendChild(this.renderer.domElement);
      this.onResize()
      this.controls = new THREE_OC.OrbitControls(this.camera, this.renderer.domElement)
      }
    },
    addEnvironment() {
     // show3d
     // add the plane
     {
         const planeSize = 3
         const loader = new THREE.TextureLoader();
         const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
         //                  const texture = loader.load('https://www.the3rdsequence.com/texturedb/download/32/texture/jpg/1024/smooth+white+tile-1024x1024.jpg')
         texture.wrapS = THREE.RepeatWrapping;
         texture.wrapT = THREE.RepeatWrapping;
         texture.magFilter = THREE.NearestFilter;
         const repeats = planeSize * 2;
         texture.repeat.set(repeats, repeats)
         const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
         const planeMat = new THREE.MeshPhongMaterial({
             map: texture,
             side: THREE.DoubleSide,
         });
         const mesh = new THREE.Mesh(planeGeo, planeMat);
         mesh.rotation.x = Math.PI * -.5;
         mesh.position.y = .0
         mesh.receiveShadow = true;
         this.scene.add(mesh);
      }
     // add sun
     {
         const skyColor = 0xB1E1FF;  // light blue
         const groundColor = 0xB97A20;  // brownish orange
         const intensity = 0.5
         const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
         this.scene.add(light);
     }
     // add directional light
     {
         const color = 0xFFFFFF;
         const intensity = 0.8;
         const light = new THREE.DirectionalLight(color, intensity);
         light.position.set(2, 3, 1.5);
         light.target.position.set(0, 0, 0);
         light.castShadow = true;
         light.shadow.camera.left = -10
         light.shadow.camera.right = 10
         light.shadow.camera.top = -10
         light.shadow.camera.bottom = 10
         light.shadow.camera.near = 0
         light.shadow.camera.far = 50
         light.shadow.camera.zoom = 8
         this.scene.add(light);
         this.scene.add(light.target);
         // const helper = new THREE.DirectionalLightHelper(light);
         // this.scene
         // const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
         // this.scene.add(cameraHelper);
     }
       // add bones
       //this.meshes = {};
       for (let body in this.animation_json.bodies) {
      let bd = this.animation_json.bodies[body]
      bd.attachedGeometries.forEach((geom) => {
          let path = 'https://mc-opencap-public.s3.us-west-2.amazonaws.com/geometries/' + geom.substr(0, geom.length - 4) + ".obj";
          objLoader.load(path, (root) => {
              root.castShadow = true;
              root.receiveShadow = true;
              root.traverse(function (child) {
                  if (child instanceof THREE.Mesh) {
                      //                               child.receiveShadow = true;
                      child.castShadow = true;
                  }
              });
              //console.log("body is ", body)
              //console.log("geom is ", geom)
              this.meshes[body + geom] = root;
              this.meshes[body + geom].scale.set(bd.scaleFactors[0], bd.scaleFactors[1], bd.scaleFactors[2])
              this.scene.add(root);
          })
      })
  }
  // finally..  
  this.trialLoading = false

  this.onResize()
  // animate



  this.delay(1000).then(() => {
    this.togglePlay(true)
  });

  },
  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  },
  onResize() {
            const container = this.$refs.mocap
            if (container && this.renderer) {
                this.renderer.setSize(container.clientWidth, container.clientHeight)
            } else {
              console.error("Error! No cointainer or renderer in onResize")
            }

            if (this.renderer) {
                const canvas = this.renderer.domElement;
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
            } else {
              console.error("Error! No renderer in onResize")
            }
        },
        animate() {
            // cancel display cycle if loading of new trial started
            if (!this.trialLoading) {
                this.delay(33.33333).then(()=> { // Super dumb but to force 30 fps right now
                  requestAnimationFrame(this.animate)
                  this.animateOneFrameNoVid()
                }) 
            }
        },
        timeToFrame(time) {
            let duration = 0
            if (this.vid0()) duration = this.vid0().duration
            if (this.vid0() && !isNaN(this.vid0().duration)) {
              let framerate = this.frames.length / duration
              let t = parseFloat(time)
              return (Math.round(t * framerate)) > this.frames.length ? this.frames.length - 1 : (Math.round(t * framerate))
            } else {
              return 0
            }
        },
        animateOneFrame() {
            let cframe

            let frames = this.frames.length
            let duration = 0
            if (this.vid0()) duration = this.vid0().duration
            if (this.vid0() && !isNaN(this.vid0().duration)) {
                console.log("are we in this.vid0?")
                let framerate = frames / duration

                if (this.videos.length > 0) {
                    let t = 0
                    if (this.vid0()) t = this.vid0().currentTime;
                    cframe = (Math.round(t * framerate)) > this.frames.length ? this.frames.length - 1 : (Math.round(t * framerate))
                    this.frame = cframe
                    if (this.vid0()) this.time = this.frame == 0 ? 0 : parseFloat(this.vid0().currentTime.toFixed(2))
                } else {
                    cframe = this.frame++

                    if (this.frame >= this.frames.length) {
                        this.frame = this.frames.length - 1
                        this.time = this.vid0().duration
                    }
                }
                this.$emit('changeTimePosition', this.time)
                
                if (cframe < this.frames.length) {
                    // display the frame
                    let json = this.animation_json;
                    for (let body in json.bodies) {
                        json.bodies[body].attachedGeometries.forEach((geom) => {
                            if (this.meshes[body + geom]) {
                                this.meshes[body + geom].position.set(
                                    json.bodies[body].translation[cframe][0],
                                    json.bodies[body].translation[cframe][1],
                                    json.bodies[body].translation[cframe][2])
                                var euler = new THREE.Euler(
                                    json.bodies[body].rotation[cframe][0],
                                    json.bodies[body].rotation[cframe][1],
                                    json.bodies[body].rotation[cframe][2]);
                                this.meshes[body + geom].quaternion.setFromEuler(euler);
                                mesh.updateMatrixWorld(true);

                            }
                        })
                    }
                }
                try{
                  this.renderer.render(this.scene, this.camera)
                } catch(error) {
                  console.log("Error: ", error)
                }
                
                //this.syncVideos()
            }
        },
  animateOneFrameNoVid() {
    let cframe;
    //console.log("Animating frame no video");
    let frames = this.frames.length;
    
    // Determine current frame
    this.frame = (this.frame + 1) % this.frames.length; // Loop back to the start if end is reached
   // console.log("this.frame is: ", this.frame);
    if (this.frame >= this.frames.length) {
        this.frame = this.frames.length - 1;
    }
    cframe = this.frame;
    if (cframe < this.frames.length) {
        // Display the frame
        let json = this.animation_json;
        for (let body in json.bodies) {
            json.bodies[body].attachedGeometries.forEach((geom) => {
                if (this.meshes[body + geom]) {
                    this.meshes[body + geom].position.set(
                        json.bodies[body].translation[cframe][0],
                        json.bodies[body].translation[cframe][1],
                        json.bodies[body].translation[cframe][2]
                    );
                    var euler = new THREE.Euler(
                        json.bodies[body].rotation[cframe][0],
                        json.bodies[body].rotation[cframe][1],
                        json.bodies[body].rotation[cframe][2]
                    );
                    this.meshes[body + geom].quaternion.setFromEuler(euler);
                }
            });
        }
    }
    
    try {
        this.renderer.render(this.scene, this.camera);
      } catch (error) {
      console.error("Rendering error: ", error);
      console.error("Scene:", this.scene);
      console.error("Camera:", this.camera);
    }
},
togglePlay(value) {
            this.playing = value

            if (this.playing) {
                this.animate()

                 /**this.videos.forEach((video, index) => {
                    const vid_element = this.videoElement(index)
                    vid_element.play()
                })*/

            } /** else {
                this.videos.forEach((video, index) => {
                    const vid_element = this.videoElement(index)
                    vid_element.pause()
                })
            }*/
        },




    /**initThreeJS() {
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 5;

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.mocap.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      window.addEventListener('resize', this.onWindowResize);

      this.animate();
    },
    loadAnimationData() {
      this.animationData = animationData;
      this.createAnimation();
    },
    createAnimation() {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      this.scene.add(cube);

      this.mixer = new THREE.AnimationMixer(cube);

      const times = this.animationData.time;
      const values = [];
      this.animationData.bodies.pelvis.rotation.forEach(rot => values.push(...rot));
      const track = new THREE.VectorKeyframeTrack('.rotation', times, values);
      const clip = new THREE.AnimationClip('rotate', -1, [track]);

      this.mixer.clipAction(clip).play();
    },
    animate() {
      requestAnimationFrame(this.animate);
      const delta = this.clock.getDelta();
      if (this.mixer) this.mixer.update(delta);
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },*/
  },
};
</script>

<style lang="scss">

.video-player {
    height: 100vh;//calc(100vh - 64px);

    .left {
        width: 100vh;
        height: 100vh;

        .trials {
            overflow-y: auto;

            .trial {
                border-radius: 4px;
                padding: 2px 6px;

                &.selected {
                    background-color: #272727;
                    cursor: default;
                }
            }
        }
    }

    .viewer {
        height: 100vh;

        #mocap {
            width: 100vh;
            overflow: hidden;
            height: 100vh;

            canvas {
              width: 100% !important; // Ensure the canvas adapts to the container width.
              height: 100% !important; // Ensure the canvas adapts to the container height.
            }
        }
      }

    .right {
        flex: 0 0 200px;
        height: 100%;

        .videos {
            overflow-y: auto;
            width: 200px;
        }
    }
}
</style>
