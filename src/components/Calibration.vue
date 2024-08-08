<template>

<v-card class="step-2-2 mt-4 flex-grow-1">
      <v-card-title class="justify-center">
        Place a checkerboard in the scene
      </v-card-title>

      <v-card-text class="d-flex align-center">
        <ul class="flex-grow-1">  
          <li>It should be visible by all cameras (nothing in the way of cameras' view when hitting Calibrate)</li>
          <li>It should be horizontal (longer side on the floor)</li>
          <li>It should be perpendicular to the floor (not lying on the floor)</li>         
        </ul>
          <div class="image-container pa-3">
          <img src="/src/assets/images/checkerboard-placement.png"/>
            <v-card-text class="d-flex align-center">
              <ul class="flex-grow-1">
                <legend> Example illustration </legend>
              </ul>
            </v-card-text>
          </div>

      </v-card-text>
      
    <!-- Debug Section -->
    <v-divider class="my-4"></v-divider>

      <!-- Inner Card -->
      <v-card-text class="step-2-2 mt-4 flex-grow-1 p-0" style="width: 80%;">
        <v-divider class="my-4"></v-divider>

        <v-card-title class="justify-center">DEBUG:</v-card-title>
        
        <!-- Input Field and Button in a Row -->
        <v-row class="mt-4" no-gutters>
          <v-col cols="18" class="pr-2">
            <v-text-field 
              v-model="inputMessage"
              clearable 
              label="Debug Message" 
              variant="solo-filled"
              full-width
              style="height: 56px;">
            </v-text-field>
          </v-col>
          <v-col cols="2">
            <v-btn @click="sendMessage" block
            style="height: 56px;">
              Send
            </v-btn>
          </v-col>
        </v-row>
        
      </v-card-text>
      
    </v-card>

</template>

<script>
import { ref } from 'vue'
import {mapState, mapActions} from 'vuex';

export default {
    name: 'Calibration',
    components: {
      
    },
    data () {
        return {

        }
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
    mounted (){

    },
    methods: {
      ...mapActions(['sendMessage', 'getBASEURL']),
    sendMessage() {
      console.log(this.sessionID)
      this.$store.dispatch('sendMessage', {
        message: this.inputMessage, 
        session_id:this.sessionID
    })
    this.inputMessage = '';
    },
    startRecording(){
      this.$store.dispatch('sendMessage', 'start')
    },
    stopRecording(){
      this.$store.dispatch('sendMessage', 'stop')
    },

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
  },
}
    



</script>