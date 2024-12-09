<template>
<v-row>
    <!-- Left Column: Buttons and TrialList -->
    <v-col cols="4" class="d-flex flex-column justify-start">
      <v-card class="mb-4">
        <v-card-title class="justify-center subject-title">
          Dynamic trials (WIP)
        </v-card-title>

        <v-card-text>
          <v-btn @click="startDynamic">
            Run dynamic Trial
            <v-tooltip activator="parent" location="bottom">
              Run test dynamic trial on backend.
            </v-tooltip>
          </v-btn>
        </v-card-text>

        <v-btn @click="this.$router.push(`/`)">Back to home</v-btn>

        <v-card-text>
          <v-btn @click="this.getVisualizerJson">Load visualizer Json</v-btn>
        </v-card-text>

        <v-card-text>
          <v-btn @click="this.stopVisualizer">Stop Visualizer</v-btn>
        </v-card-text>

        <v-btn @click="this.getTrials">Ask for trials</v-btn>

        <v-row>
          <v-card-text>
          <v-btn @click="this.downloadSession">Download Session</v-btn>
          <p> {{ this.downloadInformationMessage }} </p>
        </v-card-text>

        
        </v-row>
        
<!-- Trial List -->
<input
      type="text"
      v-model="trialName"
      :class="{ 'input-error': isDuplicate(trialName) }"
      @input="validateTrialName"
      placeholder="Enter trial name"
    />
    <button
      :disabled="isDuplicate(trialName)"
      @click="startDynamicRecording"
    >
      Start Recording
    </button>
    <span v-if="isDuplicate(trialName)" class="warning">
      Duplicate trial name!
    </span>
<TrialList :trials="session.trials" @trial-click="selectTrial" />
      </v-card>
     

      
    </v-col>

    <!-- Right Column: Visualizer -->
    <v-col cols="8" class="visualizer-container">
      <v-card class="d-flex justify-center align-center visualizer-card">
        <!-- Visualizer Component -->
        <Visualizer :animation-json="visualizerJson" />
      </v-card>
    </v-col>
  </v-row>

</template>

<script>
import {mapState, mapActions} from 'vuex'
import Visualizer from '../Visualizer.vue';
import TrialList from '../components/ui/TrialList.vue';

import animationData from '../assets/dynamic_2.json'
export default{
    name: 'Dynamic',
    components: {
        Visualizer,
        TrialList,
    },
    mounted() {
        this.$store.commit('RESET_UPLOADED_VIDEOS')
        this.getTrials()
    },
    data () {
        return {
            trialName: "", // To enter new trialName
            selectedTrial: null, //
            isRecording: false,
        }
    },
    computed: {
        ...mapState({
            sessionID: state => state.sessionID,
            cameras: state => state.sessionCameras,
            isDownloading: state => state.isDownloading,
            uploadedVideos: state => state.uploadedVideos
        }),
        ...mapState('data',{
            isTest: state => state.test_session,
            session: state => state.session,
            visualizerJson: state => state.visualizerJSON,
            trialId: state => state.newTrialId
        }),
        downloadInformationMessage(){
        if (this.isDownloading){
          return `Zipping file....`
        }
        else {
          return ""
        }
      }
    },
    watch: {
        session(newTrials) {
            "sessions changed"
            console.log(newTrials)
        },
        uploadedVideos(newAmount){
          if (newAmount == this.cameras){
            // Send to process the trial
            this.processNewTrial()
            this.$store.commit('RESET_UPLOADED_VIDEOS')
          }
        }
    },
    methods: {
        ...mapActions(['sendMessage', 'getBASEURL', 'RESET_']),
        startDynamicRecording() {
          this.$store.commit('RESET_UPLOADED_VIDEOS') // reset number of uploaded videos.. just in case.
          this.isRecording = true
          // TODO: FIX THIS TO DO RECORD -> UPLOAD -> WAIT FOR BACKEND TO SAY ALL VIDEOS ARE UPLOADED -> PROCESS TRIAL.
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
            session: this.sessionID,
          }
          this.isRecording = false
          this.sendMessage(JSON.stringify(stopDynamicMsg))
        },
        processNewTrial() {
          const startDynamicMsg = {
            command: "process_trial",
            trialType: "dynamic",
            trialName: this.trialName,
            isTest: this.isTest,
            session: this.sessionID,
            trialId: this.trialID
          }
        },
        reProcessTrial(trial){
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
        stopVisualizer(){
            this.visualizerJSON = null
            this.$store.commit('data/SET_VISUALIZER_JSON', null)
        },
        selectTrial(trial){
          this.selectedTrial = trial
          if (trial.processed){
            this.getVisualizerJson(trial)
          }
          else {
            // TODO: Check if all videos exist.
            // Process dynamic (or reprocess) trial
            this.reProcessTrial(trial)
          }
        },
        getVisualizerJson(trial) {
          this.selectedTrial = trial
            const visualizerJsonMsg = {
                command: "get_visualizer",
                trialName: trial.trialName,
                session: this.sessionID
            }
            console.log(visualizerJsonMsg)
            if(trial.processed == true) {
                this.sendMessage(JSON.stringify(visualizerJsonMsg)
            )
            }
            
            //this.visualizerJson = animationData
            //console.log(this.visualizerJson)

            /*import('../assets/dynamic_2.json') // replace with call to server.
            .then((data) => {
                console.log(data)
                this.visualizerJson = data;
            }).catch((error)=> {
                console.error('Failed to load JSON data:', error);
            });*/
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
</style>