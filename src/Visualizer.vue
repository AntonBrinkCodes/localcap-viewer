<template>
  <div class="video-player d-flex">
    <div class="viewer flex-grow-1">
      <div id="mocap" ref="mocap" class="flex-grow-1" />
      <div style="display: flex; flex-wrap: wrap; align-items: center;">
                    <v-text-field label="Time (s)" density="compact" type="number" :step="0.01" :value="time" hide-details
                        dark style="flex: 0.1; margin-right: 5px;" @input="onChangeTime"/>
                    <v-slider v-model="frame"
                              :min="0"
                              :max="frames.length-1"
                              hide-details
                              thumb-label
                              ref = "slider"
                              @change="onSliderChange"
                              @start="onSliderStart"
                        class="mb-2" style="flex: 1;" />
                </div>
    </div>
    <div class="right d-flex flex-column">
      <div class="videos flex-grow-1 d-flex flex-column">
        <video v-for="(video, index) in videos" :key="`video-${index}`" controls :ref="`video-${index}`"
          muted
          disablepictureinpicture
          playsinline :src="video.src" crossorigin="anonymous"
          @loadedmetadata = "onVideoLoadMetadata(index)"
          @timeupdate = "onVideoTimeUpdate(index)"
          @ended = "onVideoEnded(index)" 
          @error="onVideoError(index)"/>

      </div>
        
      <SpeedControl :value="playSpeed" @input="playSpeed = $event" />

      <VideoNavigation :playing="playing" :value="frame" :maxFrame="frames.length -1"
                        :disabled="videoControlsDisabled" @play="togglePlay(true)" @pause ="togglePlay(false)"
                        @input="onNavigate" class="mb-2"/>

    </div>
  </div>
    <!--<h1>Video Viewer</h1>
    <ul>
      <li v-for="video in videos" :key="video.name">
        <h3>{{ video.name }}</h3>
        <video v-if="video.src" :src="video.src" controls width="480"></video>
      </li>
    </ul>-->
</template>




<script>
import * as THREE from 'three';
import * as THREE_OC from '@/orbitControls'
import { getCurrentInstance } from 'vue'



import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import videoFile from './assets/Dynamic_1_rotatedwithKeypoints_syncd_Cam1.mp4'
import VideoNavigation from './components/ui/VideoNavigation.vue'
import SpeedControl from './components/ui/SpeedControl.vue';
//import animationData from './assets/dynamic_2.json'; // Assuming the JSON file is in the assets folder

const objLoader = new OBJLoader();

export default {
  name: 'Vizualiser',
  components: {
    VideoNavigation,
    SpeedControl
  },
  props: {
    animationJson: Object, // Receive the JSON data as a prop
    videos: [],
  },
  data() {
    return {
      timeStart: 0,
      timeEnd: 0,
      playSpeed: 1,
      playing: false,
      frames: [],
      time: 0,
      frame: 0,
      isDragging: false,
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
          this.trialLoading = true;
          //this.initializeInstance();
          this.frame = 0;
          this.playing = false;
          this.loadAnimationData();
          this.loadAndReplaceSkeleton();
          //this.setup3d();
          //this.addEnvironment();
        }
      },
      immediate: true,
    },
    videos: {
      handler(newVideos) {
      newVideos.forEach((video, index) => {
        const videoElement = this.videoElement(index);
        if (videoElement) {
          videoElement.src = video;
          videoElement.load();
        }
      });
    },
    },
    playSpeed(){
      console.log(`playspeed changed to ${this.playSpeed}`)
      this.eachVideo(videoElement =>
        videoElement.playBackRate = this.playSpeed
      )
    },
    isDragging(value){
      console.log(`usere is dragging? ${value} to value: ${this.frame}`)
      this.togglePlay(!value) // Start playing if stopped dragging. Pause if dragging.
    }
  },
  mounted() {
    console.log("Mount Visualizer...")
    this.initializeInstance();
    if (this.animation_json !== undefined && this.animation_json !== null) {
      this.loadAnimationData();
    }
    
    this.$nextTick(() =>{
      //this.initThreeJS();
      this.setup3d();
      this.addEnvironment();
  });
  },
  computed: {
    videoControlsDisabled() {
            return this.frames.length === 0
        },
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
        this.timeEnd = this.frames.length
        console.log(`endTime is: ${this.timeEnd}`)
        this.trialLoading = false;
      //});
      console.log("loaded data?", this.animation_json);
      console.log("frames", this.frames)
    },
    setup3d() {
      const container = this.$refs.mocap
      console.log("container", container)
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
    },
    addEnvironment() {
     // show3d
     // add the plane
     {
         const planeSize = 5
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
      if (this.animation_json !== undefined && this.animation_json !== null) {
      this.loadAndReplaceSkeleton()
  
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
                console.log("Container and renderer exists!")
                this.renderer.setSize(container.clientWidth, container.clientHeight)
            }

            if (this.renderer) {
              console.log("Renderer exists :)")
                const canvas = this.renderer.domElement;
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
            }
        },
        animate() {
            // cancel display cycle if loading of new trial started
            if (!this.trialLoading) {
                //this.delay(33.33333).then(()=> { // Super dumb but to force 30 fps right now. EDIT: removed now with videos added...
                  requestAnimationFrame(this.animate)
                  this.animateOneFrame()
               // }) 
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
          if (this.animation_json !== undefined && this.animation_json !== null) {
            let cframe

            let frames = this.frames.length
            let duration = 0
            if (this.vid0()) duration = this.vid0().duration
            if (this.vid0() && !isNaN(this.vid0().duration)) {
                //console.log("are we in this.vid0?")
                let framerate = frames / duration

                if (this.videos.length > 0) {
                    let t = 0
                    if (this.vid0()) t = this.vid0().currentTime;
                    cframe = (Math.round(t * framerate)) > this.frames.length ? this.frames.length - 1 : (Math.round(t * framerate))
                    this.frame = cframe
                    //console.log(`this.frame = cframe, which is: ${cframe}`)
                    this.syncSlider();
                    if (this.vid0()) this.time = this.frame == 0 ? 0 : parseFloat(this.vid0().currentTime.toFixed(2))
                } else {
                    console.log("cframe = this.frame++")
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
                            }
                        })
                    }
                }
              }
                try{
                  this.renderer.render(this.scene, this.camera)
                } catch(error) {
                  console.log("Error: ", error)
                }
                
                this.syncVideos()
            }
        },
  syncVideos(){
    if (this.synced || this.videos.length ==0 )
      return

      this.playSpeed =1
      this.synced=true
  },
  loadAndReplaceSkeleton() {
    for (let body in this.animation_json.bodies) {
      let bd = this.animation_json.bodies[body];
      
      // Remove all existing meshes from the scene
      for (const key in this.meshes) {
        if (Object.prototype.hasOwnProperty.call(this.meshes, key)) {
          const mesh = this.meshes[key];
          //console.log("Removing:", mesh);
        
          // Remove the mesh from the scene
          this.scene.remove(mesh);
        
          // Dispose of the mesh to free up resources
          this.disposeMesh(mesh);
        
          // Clear the reference from meshes
          delete this.meshes[key];
        }
      }
      bd.attachedGeometries.forEach((geom) => {
        let geometryKey = body + geom;
        let path = 'https://mc-opencap-public.s3.us-west-2.amazonaws.com/geometries/' + geom.substr(0, geom.length - 4) + ".obj";
        
        
        
        // Load the new geometry
        objLoader.load(path, (root) => {
          root.castShadow = true;
          root.receiveShadow = true;
          
          root.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              // Optionally, you can also set receiveShadow here, if needed:
              // child.receiveShadow = true;
            }
          });

          // Store the loaded geometry in the meshes object
          this.meshes[geometryKey] = root;
          this.meshes[geometryKey].scale.set(bd.scaleFactors[0], bd.scaleFactors[1], bd.scaleFactors[2]);
          
          // Add the new geometry to the scene
          this.scene.add(root);
          

        });
      });
      this.renderer.render(this.scene, this.camera)
    }
  },
  disposeMesh(mesh) {
    // Dispose of materials
    if (mesh.material) {
      mesh.material.dispose();
    }

    // Dispose of geometry if it's set
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    // Optionally, you can also dispose of any textures, but this depends on your use case
    if (mesh.material && mesh.material.map) {
      mesh.material.map.dispose();
    }
  },
  onVideoLoadMetadata(index) {
    if (index === 0) {
      console.log("onVideoLoadedMetadata ran")
        this.videos.forEach((video, index) => {
              const vid_element = this.videoElement(index)
              vid_element.currentTime = this.timeStart
        })
    }
  },
  onVideoTimeUpdate(index) {
      if (index === 0) {
        //console.log(`onVideoTimeUpdate ran.. is playing? ${this.playing}`)
          this.videos.forEach((video, index) => {
                const vid_element = this.videoElement(index)
                if(vid_element.currentTime >= this.timeEnd) {
                    vid_element.currentTime = this.timeStart
                }
          })
      }
  },
  onVideoEnded(index) {
      if (index === 0) {
        console.log("onVideoEnded ran")
          this.videos.forEach((video, index) => {
              const vid_element = this.videoElement(index)
              vid_element.currentTime = this.time = this.timeStart
              vid_element.play()
          })
      }
  },
  videoElement(index) {
      const vid = this.$refs[`video-${index}`]
      return vid ? vid[0]: null
  },
  vid0() {
      return this.videoElement(0)
  },
  onVideoError(index) {
    console.error(`Error loading video at index ${index}:`, this.videos[index]);
  },
  eachVideo(func){
    this.videos.forEach((video, index) => {
      console.log(index)
      func(this.videoElement(index))
    })
  },
  togglePlay(value) {
     this.playing = value
     if (this.playing) {
         this.animate()
         this.videos.forEach((video, index) => {
             const vid_element = this.videoElement(index)
             vid_element.play()
         })
     } else {
         this.videos.forEach((video, index) => {
             const vid_element = this.videoElement(index)
             vid_element.pause()
         })
     }
 },
 onNavigate(frame) {
     const step = this.vid0().duration / this.frames.length
     const newPosition = frame * step
     //const newPosition = this.timeStart + frame * (this.timeEnd - this.timeStart) / (this.frames.length - 1);
     this.time = newPosition; // Sync time with the new frame position.
     this.eachVideo(videoElement => {
         videoElement.currentTime = newPosition
     })
     this.animateOneFrame()
 },
 syncSlider(){
  const sliderElement = this.$refs.slider; // Make sure to add a `ref` to the slider
  if (sliderElement) {
    sliderElement.value = this.frame; // Sync manually if needed
  }
 },
 onSliderChange(newFrame) {
    this.isDragging = false; // Stop dragging
    this.frame = newFrame;  // Update the animation frame
    this.onNavigate(newFrame)
  },
  onSliderStart() {
    this.isDragging = true; // User started dragging
  },
 onChangeTime(newTime) {
    this.time=newTime
     this.eachVideo(videoElement => {
         videoElement.currentTime = newTime
     })
     this.animateOneFrame()
 },
 maxVideoDuration() {
     return this.vid0() ? (this.vid0().duration - 1) : 0
 },
},

};
</script>

<style lang="scss">

.video-player {
    height: calc(100% - 64px);
    width: 100vh;
    //left {
        //width: 100vh;

      //  .trials {
      //      overflow-y: auto;
//
      //      .trial {
      //          border-radius: 4px;
      //          padding: 2px 6px;
//
      //          &.selected {
      //              background-color: #272727;
      //              cursor: default;
      //          }
      //      }
      //  }
    //}

    .viewer {
        height: 100%;

        #mocap {
         height: calc(100vh - 100px);
            width: 100%;
            overflow: hidden;

            canvas {
                width: 100% !important;
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
