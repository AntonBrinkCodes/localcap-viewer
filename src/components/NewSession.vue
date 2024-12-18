<template>
  <MainLayout
  column
    leftButton="Back"
    rightButton="Continue"
    :step="2"
    :rightDisabled="this.mobilesCount<2"
    :leftDisabled="true"
    @left="this.$router.push(`/`)"
    @right="startCalibration">
    
  
    <v-card class="flex-grow-1 d-flex flex-column justify-center overflow-auto">
  <v-card-text class="d-flex flex-row align-center flex-wrap justify-space-between">
    <!-- Left column for text -->
    <div class="text-column d-flex flex-column flex-grow-1 mx-4">
      <h2 class="step-instruction">1. Open the OpenCap app on your phone</h2>
      <h2 class="step-instruction">2. Scan the QR code</h2>
      <h2 class="step-instruction">3. Mount your phone vertically or horizontally (unlock portrait orientation) on a tripod</h2>
      <h2 class="step-instruction">4. Position the tripod and camera to capture the volume of interest</h2>
      <h2 class="step-instruction">5. Repeat 1-4 for all phones you want to connect</h2>
      <h2 class="step-instruction">6. Have the person practice the activity and verify that they are fully in view of at least 2 cameras</h2>
    </div>

    <!-- Right column for QR code -->
    <div class="qr-container d-flex align-center justify-center mx-4">
      <QRCodeVue3 :value="qrURL" class="qr-code" />
    </div>
  </v-card-text>
</v-card>

      
      
     <!-- Button at the Bottom -->
     <div v-if="mobilesCount >= 0" class="button-container d-flex justify-center mb-4">
        <v-btn @click="startCalibration" >
          Begin Calibration
        </v-btn>
      </div>
  </MainLayout>
    
  </template>
  
  <script>
  import { ref } from 'vue';
  import QRCodeVue3 from 'qrcode-vue3';
  import { mapState, mapActions } from 'vuex';
  import MainLayout from '../layout/MainLayout.vue';
import { mapMutations } from 'vuex/dist/vuex.cjs.js';
  
  export default {
    name: 'NewSession',
    components: {
      QRCodeVue3,
      MainLayout
    },
    computed: {
      ...mapState({
        connectionStatus: 'connectionStatus',
        clientsCount: 'clientsCount',
        mobilesCount: 'sessionCameras',
        receivedMessage: 'receivedMessage',
        BASEURL: (state) => state.BASEURL,
        sessionID: (state) => state.sessionID,
      }),
      ...mapState('data', {
      calibrated: state => state.calibrated,
    }),
      qrURL() {
        //console.log(`ws://${this.BASEURL}/ws/${this.sessionID}/session`)
        console.log(`${this.BASEURL}/${this.sessionID}`)
        return `${this.BASEURL}/${this.sessionID}`
      },
    },
    methods: {
      ...mapActions(['sendMessage', 'getBASEURL']),
      async startCalibration() {
        this.SET_CALIBRATED(false)
        const checkSessionID = setInterval(() => {
          if (this.sessionID) {
            clearInterval(checkSessionID);
            this.$router.push(`/${this.sessionID}/Calibration`);
          }
        }, 100);
      },
      ...mapMutations('data', ['SET_CALIBRATED']), // Acess mutations
    },
    
  };
  </script>
  

<style lang="scss">

.flex-grow-1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
}

.v-card-text {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
}

.text-column {
  flex-grow: 1;
  max-width: 60%; /* Adjust for preferred width of text column */
  margin: 1rem;
}

.step-instruction {
  margin: 1rem 0;
  font-size: 1.2rem; /* Adjust font size as needed */
}

.qr-container {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 30%; /* Adjust for preferred QR code size */
  margin: 1rem;
}

.qr-code {
  max-width: 100%;
  height: auto;
}
.step-4-1 {
  flex: 0 0 80%;
  li {
    font-size: 16px;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}
.step-4-2 {
  flex-grow: 1;
  h1 {
    line-height: 1.15;
  }
}
.step-1 {
  width:100%;

  .qr-container {
    width: 200px;
    height: 200px;
    overflow: hidden;
  }
}

.subject-details {
  min-width: 100%;
  &>span>div {
    padding-top: 0;
  }
}

.form-divider {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
}


.images-box {
  display: flex;
  flex-direction: column;
  height: fit-content;

  ul {
    font-size: 16px;
  }
}

.checkbox-box > div {
  margin-top: 0;
}

.centered-settings {
    position: fixed;
    width: 50%;
    text-align: center;
    top: 25%;
    left: 50%;
    padding: 20px;
    transform: translate(-50%, 0);
    display: none;
}

.overlay-panel {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.6;
    display: none;
}

.space-above-small {
  margin-top: 15px; /* Adjust the value as needed */
}

.space-above-large {
  margin-top: 20px; /* Adjust the value as needed */
  font-size: 20px;  /* Adjust the font size as needed */
  font-weight: bold;
}


</style>
  