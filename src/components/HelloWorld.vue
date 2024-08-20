<template>
  <MainLayout
    column
    leftButton="Back"
    rightButton="Calibrate"
    :step="2"
    :rightDisabled="this.cameras>=2"
    :leftDisabled="true"
    @left="this.$router.push(`/`)"
    @right="startSession">


  <div>
    <v-card class="fill-height fill-width d-flex flex-column justify-space-between">
      <v-card-text class="d-flex flex-column align-center flex-grow-1">
        <v-row class="d-flex align-center flex-wrap fill-height w-100">
          <v-col cols="12" md="6" class="d-flex flex-column justify-space-between my-1">
            <div>
              <h1 class="my-1"> Websocket Client  </h1>
              <h1 class="my-1"> {{ connectionStatus }}</h1>
              <h1 class="my-1">Web-apps connected: {{ clientsCount }}</h1>
              <h1 class="my-1">Mobiles connected: {{ mobilesCount }}</h1>
            </div>
    
          </v-col>
          <!-- Start new Session button-->
      <v-btn @click="startSession">
        New Session
      </v-btn>  
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</MainLayout>

</template>

<script>
import { ref } from 'vue'
import QRCodeVue3 from "qrcode-vue3";
import {mapState, mapActions} from 'vuex';
import MainLayout from '../layout/MainLayout.vue';
export default {
  name: 'Home',
  components: {
    MainLayout
  },
  computed: {
    ...mapState({
      connectionStatus: 'connectionStatus',
      clientsCount: 'clientsCount',
      mobilesCount: 'mobilesCount',
      recievedMessage: 'receivedMessage',
      BASEURL: state =>  state.BASEURL,
      sessionID: state => state.sessionID,
    }),
  },
  methods: {
    ...mapActions(['sendMessage', 'getBASEURL']),
    sendMessage() {
      this.$store.dispatch('sendMessage', this.inputMessage);
      this.inputMessage = '';
    },
    startRecording(){
      this.$store.dispatch('sendMessage', 'start')
    },
    stopRecording(){
      this.$store.dispatch('sendMessage', 'stop')
    },
    async startSession(){
      if(this.sessionID || this.$store.state.sessionWebSocket){
        console.log("Removing old session")
        // remove session ID and disconnect session websockets

        this.$store.dispatch('disconnectSessionWebSocket')
        
      }
          // Create a session on the websocket and get the UUID for it.
      // This should also Commit UUID to state.
      await this.$store.dispatch('createSessionOnServer', 'newSession')
      //await this.$router.push(`javasc/${this.$store.sessionID}/Calibration`)
      // Check sessionID every 0.1 seconds. Waiting for response from server basically.
      const checkSessionID = setInterval(() => {
        console.log("checking for SessionID")
        if (this.sessionID) {
          clearInterval(checkSessionID);
          this.$store.dispatch('connectSessionWebSocket')
          this.$router.push(`/${this.sessionID}/session`);
        }
      }, 100);
      
    },
    
  },
  created() {
    //this.$store.dispatch('connectWebSocket');

  },
  setup() {
    const count = ref(0);
    const msg = ref("");
    //const BASEURL = store.state;
    
    const inputMessage = ref('');

    return {
      count,
      msg,
      URL,
      inputMessage, // Bind the input to the message
    };
  }
};
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
