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
    data () {
        return {
            trialName: "", // To enter new trialName
        }
    },
    computed: {
        ...mapState({
            sessionID: state => state.sessionID,
            cameras: state => state.sessionCameras,
        }),
        ...mapState('data',{
            isTest: state => state.test_session,
            session: state => state.session,
            visualizerJson: state => state.visualizerJSON
        }),
    },
    watch: {
        session(newTrials) {
            console.log(newTrials)
        }
    },
    methods: {
        ...mapActions(['sendMessage', 'getBASEURL']),
        startDynamic() {
            const startDynamicMsg = {
                command: "start_dynamic",
                trialName: this.trialName,
                isTest: this.isTest,
                session: this.sessionID
            }
            console.log('message is: ', startDynamicMsg)
            this.sendMessage({
                message: JSON.stringify(startDynamicMsg),
                session_id: this.sessionID
            })
        },
        getTrials(){
            const getTrialsMsg = {
                command: "get_session_trials", 
                isTest: this.isTest,
                session: this.sessionID              
            }
            this.sendMessage({
                message: JSON.stringify(getTrialsMsg),
                session_id: this.sessionID
            })
        },
        stopVisualizer(){
            this.visualizerJSON = null
            this.$store.commit('data/SET_VISUALIZER_JSON', null)
        },
        getVisualizerJson(trial) {
            const visualizerJsonMsg = {
                command: "get_visualizer",
                trialName: trial.trialName,
                session: this.sessionID
            }
            console.log(visualizerJsonMsg)
            if(trial.processed == true) {
                this.sendMessage({message: JSON.stringify(visualizerJsonMsg),
                session_id: this.sessionID
            })
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
    },
    onMounted() {
        console.log('the visualizerJSON is: ', visualizerJson)
        //this.getTrials()
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