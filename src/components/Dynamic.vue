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
        </v-card>
  
        <!-- Trial List -->
        <TrialList :trials="session.trials" @trial-click="getVisualizerJson" />
      </v-col>
  
      <!-- Right Column: Visualizer -->
      <v-col cols="8" class="visualizer-container" style="height: 100%;">
        <v-card class="visualizer-card" style="height: 100%; padding: 0;">
            <Visualizer v-show="visualizerJson" :animation-json="visualizerJson" />
            <div v-show="!visualizerJson">
            <p>No Visualizer Loaded</p>
            </div>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  import Visualizer from '../Visualizer.vue';
  import TrialList from '../components/ui/TrialList.vue';
  
  export default {
    name: 'Dynamic',
    components: {
      Visualizer,
      TrialList,
    },
    data() {
      return {
        trialName: "", // To enter new trialName
      };
    },
    computed: {
      ...mapState({
        sessionID: (state) => state.sessionID,
        cameras: (state) => state.sessionCameras,
      }),
      ...mapState("data", {
        isTest: (state) => state.test_session,
        session: (state) => state.session,
        visualizerJson: (state) => state.visualizerJSON,
      }),
    },
    methods: {
      ...mapActions(["sendMessage", "getBASEURL"]),
      startDynamic() {
        const startDynamicMsg = {
          command: "start_dynamic",
          trialName: this.trialName,
          isTest: this.isTest,
          session: this.sessionID,
        };
        console.log("message is: ", startDynamicMsg);
        this.sendMessage({
          message: JSON.stringify(startDynamicMsg),
          session_id: this.sessionID,
        });
      },
      getTrials() {
        const getTrialsMsg = {
          command: "get_session_trials",
          isTest: this.isTest,
          session: this.sessionID,
        };
        this.sendMessage({
          message: JSON.stringify(getTrialsMsg),
          session_id: this.sessionID,
        });
      },
      stopVisualizer() {
        this.visualizerJSON = null;
        this.$store.commit("data/SET_VISUALIZER_JSON", null);
      },
      getVisualizerJson(trial) {
        const visualizerJsonMsg = {
          command: "get_visualizer",
          trialName: trial.trialName,
          session: this.sessionID,
        };
        console.log(visualizerJsonMsg);
        if (trial.processed == true) {
          this.sendMessage({
            message: JSON.stringify(visualizerJsonMsg),
            session_id: this.sessionID,
          });
        }
      },
    },
    unmounted() {
      console.log("Unmounting Dynamic.");
      const emptyDict = {};
      this.$store.commit("data/SET_SESSION_TRIALS", emptyDict);
      this.$store.commit("data/SET_VISUALIZER_JSON", null);
    },
  };
  </script>
  
  <style scoped>
  .visualizer-container {
  height: 100vh; /* Fill the viewport height */
  display: flex; /* Allow child elements to stretch */
  flex-direction: column;
}

.visualizer-card {
  flex: 1; /* Ensure card grows to fill its container */
  display: flex;
  flex-direction: column; /* Ensure content is aligned vertically */
  align-items: center;
  justify-content: center; /* Center content */
  height: 100%; /* Ensure card fills the container */
}
.visualizer-card #mocap {
  width: 100%; /* Fill available width */
  height: 100%; /* Fill available height */
  overflow: hidden; /* Prevent scrollbars */
}
  </style>
  