<template>
  <div>
    <h1>WebSocket Client</h1>
    <p id="status">{{ connectionStatus }}</p>
    <p id="clients">Web-apps connected: {{ clientsCount }}</p>
    <p id="mobiles">Mobiles connected: {{ mobilesCount }}</p>
    <h1>{{ msg }}</h1>
    <!-- Conditionally rendered buttons in a flexbox container -->
    <div v-if="mobilesCount >= 0" class="button-container">
      <button @click="startRecording">Start Recording</button>
      <button @click="stopRecording">Stop Recording</button>
      <button @click="startSession"> Start Session</button>
    </div>
    <p>
      <QRCodeVue3 :value="qrURL"></QRCodeVue3>
    </p>
    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p>
        Edit
        <code>components/HelloWorld.vue</code> to test HMR
      </p>
      <p>
        <strong>Current route path:</strong> {{ $route.fullPath }}
      </p>
      </div>

      <div class="message-container">
      <input type="text" v-model="inputMessage" placeholder="Type your message..." />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import QRCodeVue3 from "qrcode-vue3";
import {mapState, mapActions} from 'vuex';

export default {
  name: 'Home',
  components: {
    QRCodeVue3
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
    qrURL() {
      return `ws://${this.BASEURL}/ws`;
    }
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
          // Create a session on the websocket and get the UUID for it.
      // This should also Commit UUID to state.
      await this.$store.dispatch('createSessionOnServerlog', 'newSession')
      //await this.$router.push(`/${this.$store.sessionID}/Calibration`)

      // Check sessionID every 0.1 seconds
      const checkSessionID = setInterval(() => {
        console.log("checking for SessionID")
        if (this.sessionID) {
          clearInterval(checkSessionID);
          this.$router.push(`/${this.sessionID}/Calibration`);
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
