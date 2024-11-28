<template>

    <v-card class="mb-4">
        <v-card-title class="justify-center subject-title">
          Dynamic trials (WIP)
        </v-card-title>

        <v-card-text>
            <v-btn @click="startDynamic">
                Run dynamic Trial
             <v-tooltip
                activator="parent"
                location="bottom"
            >Run test dynamic trial on backend.</v-tooltip>
            </v-btn>
        </v-card-text>

        <v-btn @click="this.$router.push(`/`)" >
            Back to home
        </v-btn>


        <v-card-text>
            <v-btn @click="this.getVisualizerJson" >
                Load visualizer Json
            </v-btn>
        </v-card-text>

        <v-card-text>
            <v-btn @click="this.stopVisualizer" >
                Stop Visualizer
            </v-btn>
        </v-card-text>

        <v-btn @click="this.getTrials">
            ask for trials
        </v-btn>
    </v-card>

    <v-card-text>
      <!-- Include the Visualizer component and pass the visualizerJson and other necessary data as props -->
      <Visualizer v-if="this.visualizerJson" :animation-json="visualizerJson" />
    </v-card-text>

    <div>
    <h1>Session Trials</h1>
    <ul>
      <li v-for="trial in session.trials" :key="trial.uuid">
        {{ trial.trialName }} - Processed: {{ trial.processed }}
      </li>
    </ul>
  </div>

</template>

<script>
import {mapState, mapActions} from 'vuex'
import Visualizer from '../Visualizer.vue';
import animationData from '../assets/dynamic_2.json'
export default{
    name: 'Dynamic',
    components: {
        Visualizer,
    },
    data () {
        return {
            trialName: "", // To enter new trialName
            visualizerJson: null,
        }
    },
    computed: {
        ...mapState({
            sessionID: state => state.sessionID,
            cameras: state => state.sessionCameras,
        }),
        ...mapState('data',{
            isTest: state => state.test_session,
            session: state => state.session
        }),
    },
    watch: {
        trials(newTrials) {
            console.log(newTrials)
        }
    },
    methods: {
        ...mapActions(['sendMessage', 'getBASEURL']),
        startDynamic() {
            const startDynamicMsg = {
                command: "start_dynamic",
                trialName: this.trialName,
                isTest: this.isTest
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
            }
            this.sendMessage({
                message: JSON.stringify(getTrialsMsg),
                session_id: this.sessionID
            })
        },
        stopVisualizer(){
            this.visualizerJson = null
        
        },
        getVisualizerJson() {
            this.visualizerJson = animationData
            console.log(this.visualizerJson)

            /*import('../assets/dynamic_2.json') // replace with call to server.
            .then((data) => {
                console.log(data)
                this.visualizerJson = data;
            }).catch((error)=> {
                console.error('Failed to load JSON data:', error);
            });*/
        },
    },
    created() {
        this.getTrials()
    }

    
}

</script>