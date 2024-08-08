<template>
    <v-card class="fill-height fill-width d-flex flex-column justify-space-between">
      <!-- Card Content (Instructions and QR code) -->
      <v-card-text class="d-flex flex-column align-center flex-grow-1">
        <v-row class="d-flex align-center flex-wrap fill-height w-100">
          <v-col cols="12" md="6" class="d-flex flex-column justify-space-between my-1">
            <div>
              <h1 class="my-4">1. Open the OpenCap app on your phone</h1>
              <h1 class="my-4">2. Scan the QR code</h1>
              <h1 class="my-4">3. Mount your phone vertically or horizontally (unlock portrait orientation) on a tripod</h1>
              <h1 class="my-4">4. Position the tripod and camera to capture the volume of interest</h1>
              <h1 class="my-4">5. Repeat 1-4 for all phones you want to connect</h1>
              <h1 class="my-4">6. Have the person practice the activity and verify that they are fully in view of at least 2 cameras</h1>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center justify-center">
            <QRCodeVue3 :value="qrURL" />
          </v-col>
          <!-- Button at the Bottom -->
      <div v-if="mobilesCount >= 0" class="button-container d-flex justify-center mb-4">
        <v-btn @click="startCalibration" >
          Begin Calibration
        </v-btn>
      </div>
        </v-row>
      </v-card-text>
      
      
    </v-card>
  </template>
  
  <script>
  import { ref } from 'vue';
  import QRCodeVue3 from 'qrcode-vue3';
  import { mapState, mapActions } from 'vuex';
  
  export default {
    name: 'NewSession',
    components: {
      QRCodeVue3,
    },
    computed: {
      ...mapState({
        connectionStatus: 'connectionStatus',
        clientsCount: 'clientsCount',
        mobilesCount: 'mobilesCount',
        receivedMessage: 'receivedMessage',
        BASEURL: (state) => state.BASEURL,
        sessionID: (state) => state.sessionID,
      }),
      qrURL() {
        console.log(`ws://${this.BASEURL}/ws/${this.sessionID}/session`)
        return `ws://${this.BASEURL}/ws/${this.sessionID}/session`;
      },
    },
    methods: {
      ...mapActions(['sendMessage', 'getBASEURL']),
      async startCalibration() {
        const checkSessionID = setInterval(() => {
          if (this.sessionID) {
            clearInterval(checkSessionID);
            this.$router.push(`/${this.sessionID}/Calibration`);
          }
        }, 100);
      },
    },
    
  };
  </script>
  
  <style scoped>
  .fill-height {
    height: 100vh;
  }
  
  .fill-width {
    width: 100vw;
  }
  
  .button-container {
    width: 100%;
    text-align: center;
  }

  .v-card {
  box-sizing: border-box;
  overflow: auto; /* Prevent content from being cut off */
}
  </style>
  