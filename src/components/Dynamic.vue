<template>
<v-row :style="{ backgroundColor: '#000000' }">
    <!-- Left Column: Buttons and TrialList -->
    <v-col cols="2" class="d-flex flex-column justify-start " style="height: 100vh; overflow-y: auto;">
        <!-- Trial List -->
<input
      type="text"
      v-model="trialName"
      :class="{ 'input-error': isDuplicate(trialName) }"
      @input="validateTrialName"
      placeholder="Enter trial name"
      class="trial-name-input"
      :disabled="isRecording || isUploading" 

    />
    <v-btn variant ="outlined" @click="handleDynamicRecording">
      {{ isRecording ? `Stop (${formattedTime})` : 'Start Recording' }}
    </v-btn>
    <span v-if="isDuplicate(trialName)" class="warning">
      Duplicate trial name!
    </span>


    <TrialList :trials="session.trials" @trial-click="selectTrial" @hamburger-click="openDialogForTrial" class="trial-list"/>
    <ReprocessDialog
      :visible="isDialogVisible"
      :item="selectedTrial"
      :cameraCount="this.session.maxCams"
      @close="isDialogVisible = false"
      @reprocess="handleReprocess"
      />
        
     
    <v-expansion-panels class = "mt-auto" style="background-color: #000000;">
      <v-expansion-panel :class="'black-panel'">
            <v-expansion-panel-title class="black-panel-header">
              Options
            </v-expansion-panel-title>
            <v-card-text style="padding-top: 5px; padding-bottom: 0; font-size: 16px;">
                <p>max framerate is: {{ this.maxFrameRate }} </p>
              </v-card-text>
        <v-expansion-panel-text>
          <v-btn variant ="outlined" @click="this.$router.push(`/`)" >Home</v-btn>
          <v-btn variant ="outlined" @click="this.downloadSession">Download</v-btn>
          <v-btn variant ="outlined" @click="this.getTrials">Refresh Trials</v-btn>
          <v-checkbox v-model="this.stopAutoProcess" label="Stop trial from automatically processing after upload"></v-checkbox>          
          <v-select
      v-model="selectedFrameRate"
      :items="filteredFrameRates"
      item-title="name"
      item-value="value"
      label="Select frame rate"
      return-object
      :disabled="isRecording || isUploading"
    ></v-select>
        <!-- Add camera frame rate button here! -->
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    

    <!--<v-expansion-panels class = "mt-auto position-absolute-bottom-0">
      <v-expansion-panel>
  <v-expansion-panel-text>
    <v-btn @click="this.$router.push(`/`)">Back to home</v-btn>
    <v-btn @click="this.getTrials">Ask for trials</v-btn>
    <v-row>
      <v-card-text>
        <v-btn @click="this.downloadSession">Download Session</v-btn>
        <p>{{ downloadInformationMessage }}</p>
      </v-card-text>
    </v-row>
  </v-expansion-panel-text>
</v-expansion-panel>
</v-expansion-panels>    -->
      <!-- Expandable Panel for Last Buttons -->
     

      
    </v-col>

    <!-- Right Column: Visualizer -->
    <v-col cols="10" class="visualizer-container" :style="{ backgroundColor: '#000000' }">
      <v-card class="d-flex justify-center align-center visualizer-card">
        <!-- Visualizer Component -->
        <Visualizer :animation-json="visualizerJson"
        :videos = visualizerVideos />
      </v-card>
    </v-col>
  </v-row>

</template>

<script>
import {mapState, mapActions} from 'vuex'
import Visualizer from '../Visualizer.vue';
import TrialList from '../components/ui/TrialList.vue';
import { TiltLoader } from 'three/examples/jsm/Addons.js';
import ReprocessDialog from '../components/ui/ReprocessDialog.vue';

//import animationData from '../assets/dynamic_2.json'
export default{
    name: 'Dynamic',
    components: {
        Visualizer,
        TrialList,
        ReprocessDialog,
    },
    mounted() {
        this.$store.commit('RESET_UPLOADED_VIDEOS')
        this.getTrials()
        this.getVideoCount()
        // set default selected frame rate
        this.selectedFrameRate = this.filteredFrameRates[0];

    },
    data () {
        return {
            trialName: "", // To enter new trialName
            stopAutoProcess: false,
            selectedTrial: null, //
            isDialogVisible: false,
            isRecording: false,
            isUploading: false,
            recordingStartTime: null,
            elapsedTime: 0,
            timerInterval: null,
            frameRateOptions: [
  { name: '60', value: '60', descr: 'default frame rate' },
  {name: '100', value: '100', discr: '100 fps'},
  { name: '120', value: '120', descr: 'high frame rate' },
  {name: '200', value: '200', descr: '200 fps'},
  { name: '240', value: '240', descr: 'Highest motion' }
],
selectedFrameRate: null
        }
    },
    computed: {
        ...mapState({
            sessionID: state => state.sessionID,
            cameras: state => state.sessionCameras,
            isDownloading: state => state.isDownloading,
            uploadedVideos: state => state.uploadedVideos,
            maxFrameRate: state => state.maxFrameRate
        }),
        ...mapState('data',{
            isTest: state => state.test_session,
            session: state => state.session,
            visualizerJson: state => state.visualizerJSON,
            trialId: state => state.newTrialId,
            visualizerVideos: state => state.visualizerVideos
        }),
        downloadInformationMessage(){
        if (this.isDownloading){
          return `Zipping file....`
        }
        else {
          return ""
        }
      },
      formattedTime() {
        const centiseconds = Math.floor(this.elapsedTime / 10) % 100; // Get centiseconds (ms / 10)
        const seconds = Math.floor(this.elapsedTime / 1000) % 60; // Get total seconds, modulo 60
        const minutes = Math.floor(this.elapsedTime / 60000); // Get total minutes
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}:${centiseconds < 10 ? '0' : ''}${centiseconds}`;
      },
      filteredFrameRates() {
      return this.frameRateOptions.filter(
        option => Number(option.value) <= this.maxFrameRate
      );
    },
    },
    watch: {
        session(newTrials) {
            "sessions changed"
            console.log(newTrials)
        },
        uploadedVideos(newAmount){
          if (newAmount == this.cameras){
            // Send to process the trial
            this.isUploading = false
            if (!stopAutoProcess) {
              this.processNewTrial()
            }
            this.$store.commit('RESET_UPLOADED_VIDEOS')
          }
        },
        trialId(newValue){
          console.log(`New trial ID is: ${newValue}`)
        },
        selectedFrameRate(newValue){
          // Send to webapp a message to change the frame rate (we do not send if the webapp is recording)
          if (!this.isRecording){
            console.log(`Sending to set framerate to: ${this.selectedFrameRate.value} (or is it ${newValue.value}?)`)
            const framerateMessage = {
              command: "set_framerate",
              session: this.sessionID,
              framerate: this.selectedFrameRate.value
            }
            this.sendMessage(JSON.stringify(framerateMessage))
          }
        },
    },
    methods: {
        ...mapActions(['sendMessage', 'getBASEURL', 'RESET_']),
        handleDynamicRecording(){
          if (this.isRecording){
            clearInterval(this.timerInterval); // Stop the timer
            this.stopDynamic()
            this.elapsedTime = 0; // Reset elapsed time
          } else {
            this.recordingStartTime = Date.now(); // Adjust the start time if previously paused
            this.startTimer()
            this.startDynamicRecording()
          }
        },
        startTimer() {
        this.timerInterval = setInterval(() => {
        this.elapsedTime = Date.now() - this.recordingStartTime; // Update elapsed time every second
      }, 100);
    },
        startDynamicRecording() {
          this.$store.commit('RESET_UPLOADED_VIDEOS') // reset number of uploaded videos.. just in case.
          this.isRecording = true
          console.log("Starting recording")
            const startDynamicMsg = {
                command: "start_recording",
                trialType: "dynamic",
                trialName: this.trialName,
                isTest: this.isTest,
                session: this.sessionID,
            }
            console.log('message is: ', startDynamicMsg)
            this.sendMessage(
                JSON.stringify(startDynamicMsg)
            )
        },
        stopDynamic(){
          const stopDynamicMsg = {
            command: "stop_recording",
            trialType: "dynamic",
            trialName: this.trialName,
            trialId: this.trialId,
            session: this.sessionID,
          }
          this.isRecording = false
          this.isUploading = true
          this.sendMessage(JSON.stringify(stopDynamicMsg))
        },
        processNewTrial() {
          console.log(`Sending to process trial ${this.trialId}`)
          const startDynamicMsg = {
            command: "process_trial",
            trialType: "dynamic",
            trialName: this.trialName,
            isTest: this.isTest,
            session: this.sessionID,
            trialId: this.trialId
          }
          this.sendMessage(JSON.stringify(startDynamicMsg))
        },
        reProcessTrial(trial){ // Basic reprocess with default settings
          const startDynamicMsg = {
            command: "process_trial",
            trialType: "dynamic",

            trialName: trial.trialName,
            isTest: this.isTest,
            session: this.sessionID,
            trialId: trial.uuid,
          }
          console.log('message is', startDynamicMsg)
          this.sendMessage(JSON.stringify(startDynamicMsg))

        },
        openDialogForTrial(trial){
          console.log('opening trial', trial.trialName)
          this.selectedTrial = trial
          this.isDialogVisible = true;
        },
        handleReprocess(payload){ // reprocess with settings applied from hamburger menu.
          console.log('reprocess payload', payload)
          const trialType = payload.item.trialName != "neutral" ? "dynamic" : "neutral"
          console.log('trialType: ', trialType)
          const reprocessMsg = {
            command: "reprocess_trial",
            trialType: trialType,
            trialName: payload.item.trialName,
            session: this.sessionID,
            trialId: payload.item.uuid,
            forceRedoPoseEstimation: payload.forceRedo,
            cameras_to_use: payload.cameras,
            poseEstimator: payload.poseModel,
            resolution: payload.resolution
          }
          console.log(reprocessMsg)

          this.sendMessage(JSON.stringify(reprocessMsg))
        },  
        getTrials(){
            const getTrialsMsg = {
                command: "get_session_trials", 
                isTest: this.isTest,
                session: this.sessionID              
            }
            this.sendMessage(
                JSON.stringify(getTrialsMsg)
            )
        },
        getVideoCount() {
          const getVideoCountMsg = {
            command:"get_max_video_count",
            session: this.sessionID
          }
          this.sendMessage(JSON.stringify(getVideoCountMsg))
        },

        stopVisualizer(){
            this.visualizerJSON = null
            this.$store.commit('data/SET_VISUALIZER_JSON', null)
        },
        selectTrial(trial){
          this.selectedTrial = trial
          if (trial.processed == "True"){
            this.getVisualizerJson(trial)
            this.getVisualizerVideo(trial)
          }
          else if (trial.processed == "False") {
            // TODO: Check if all videos exist.
            // Process dynamic (or reprocess) trial
            this.reProcessTrial(trial)
          }
        },
        getVisualizerVideo(trial){
          const visualizervideoJsonMsg = {
            command: "get_visualizer_videos",
            trialName: trial.trialName,
            session: this.sessionID,
          }
          this.sendMessage(JSON.stringify(visualizervideoJsonMsg))
        },
        getVisualizerJson(trial) {
            const visualizerJsonMsg = {
                command: "get_visualizer",
                trialName: trial.trialName,
                session: this.sessionID
            }
            if(trial.processed == "True") {
              console.log("Asking for visualizer json")
                this.sendMessage(JSON.stringify(visualizerJsonMsg)
            )
            } else {
              console.log("asked for json but trial not processed.")
            }
        },

        downloadSession() {
        // Send a WebSocket request to download the session
          const downloadMsg = {
            command: "download_session",
            session: this.sessionID,
          }
          this.sendMessage(JSON.stringify(downloadMsg))
    },
    isDuplicate(name) {
      // Check if the trial name exists in the session's trials list
      return (
        name &&
        this.session.trials.some((trial) => trial.trialName === name)
      );
    },
    validateTrialName() {
      if (this.isDuplicate(this.trialName)) {
        console.warn(`Duplicate trial name: ${this.trialName}`);
      }
    },
      
    },
    
    unmounted() {
        console.log("Unmounting Dynamic.")
        const emptyDict = {}
        this.$store.commit('data/SET_SESSION_TRIALS', emptyDict)
        this.$store.commit('data/SET_VISUALIZER_JSON', null)
        this.$store.commit('data/SET_VISUALIZER_VIDEOS', [])
    }

    
}

</script>

<style scoped>
.visualizer-container {
  /* Flex container settings to fill available space */
  display: flex;
  justify-content: center;  /* Center the content horizontally */
  align-items: center;      /* Center the content vertically */
  height: 100vh;            /* Ensure it takes full height of the viewport */
  width: 100vh;              /* Ensure it takes full width of the container */
}

.visualizer-card {
  /* Optional: Add some padding or a fixed size for the visualizer card */
  width: 100vh;
  height: 100vh;
  max-width: 100vh;          /* Prevent overflow */
  max-height: 100vh;         /* Prevent overflow */
  display: flex;
  justify-content: center;  /* Center the visualizer within the card */
  align-items: center;      /* Center the visualizer within the card */
}

.subject-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1976D2;
  text-align: center;
}

.d-flex {
  display: flex;
  background-color: #000000;
}

.flex-column {
  flex-direction: column;
}

.justify-start {
  justify-content: flex-start;
}

.justify-center {
  justify-content: center;
}

.trial-list {
  min-width: 100%;
  max-width: 100%;
}

.mt-auto {
  margin-top: auto; /* This ensures that the expansion panel goes to the bottom */
}
/* Optional: Style the input and buttons */
.trial-name-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  margin-top: 10px;
}

/* Styling for the expansion panel and header */
.black-panel {
  background-color: #000000 !important; /* Apply black background */
}

.black-panel-header {
  background-color: #000000 !important; /* Ensure header is black */
  color: #ffffff; /* Set text color to white for contrast */
}

</style>