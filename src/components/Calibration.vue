<template>
  <MainLayout
    column
    leftButton="Back"
    :rightButton="rightButtonText"
    :step="2"
    :rightDisabled="false"
    @left="$router.push(`/${sessionID}/session`)"
    @right="onNext"
  >
  <v-container fluid style="overflow: scroll; min-height: calc(100vh - 50px);">
    <!-- Row 1 -->
    <v-row class="row-equal">
      <v-col cols="12">
        <v-card class="step-2-2 flex-grow-1 pa-4">
          <v-row class="align-center">
            <v-col cols="6" class="pr-4">
              <v-card-title class="justify-center text-h6">
                Place a checkerboard in the scene
              </v-card-title>
              <v-card-text class="d-flex flex-column text-left text-body-1">
                <ul class="pl-4">
                  <li>It should be visible by all cameras (nothing in the way of cameras' view when hitting Calibrate)</li>
                  <li>It should be horizontal (longer side on the floor)</li>
                  <li>It should be perpendicular to the floor (not lying on the floor)</li>
                </ul>
              </v-card-text>
            </v-col>

            <v-col cols="6" class="pl-4">
              <div class="image-container text-center">
                <img 
                  src="../assets/images/checkerboard-placement.png" 
                  class="img-fluid checkerboard-image" 
                  alt="Checkerboard Placement" 
                />
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Row 2 -->
    <v-row class="row-equal">
  <v-col cols="12">
    <v-card class="step-2-2 flex-grow-1 pa-4">
      <v-row class="align-center">
        <v-col cols="6" class="pr-4">
          <v-card-title class="align-center">Provide the checkerboard details</v-card-title>
          <v-card-text class="d-flex align-center">
            <!-- Create a new row for the Text Field and Select -->
            <v-row class="d-flex align-center">
              <v-col cols="3" class="flex-grow-1 flex-shrink-1" >
                <v-text-field v-model="rows" label="Rows" class="mr-3" />
              </v-col>
              <v-col cols="3" class="flex-grow-1 flex-shrink-1" >
                <v-text-field v-model="cols" label="Columns" class="mr-3" />
              </v-col>
              <v-col cols="8" class="flex-grow-1 flex-shrink-1">
                <v-text-field v-model="squareSize" label="Square size (mm)" />
              </v-col>
            <!-- v-select will be placed in another row -->
              <v-col cols="8" class="flex-grow-1 flex-shrink-1">
                <v-select 
                  v-model="placement"
                  :items="items"
                  item-title="name"
                  item-value="value"
                  label="Placement"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.descr"></v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-col>

        <v-col cols="6" class="pl-4">
          <div class="image-container text-center">
            <img 
              src="/src/assets/images/checkerboard_45.png" 
              class="img-fluid checkerboard-image" 
              alt="Checkerboard Placement" 
            />
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</v-row>


<v-expansion-panels>
  <v-expansion-panel>
    <v-expansion-panel-title>
      DEBUG
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-row class="debug-row">
        <v-col cols="12">
          <v-card class="step-2-2 flex-grow-1 p-4">
            <v-card-title class="justify-center">DEBUG:</v-card-title>
            <v-row class="mt-4" no-gutters>
              <v-col cols="2">
                <v-checkbox
                  v-model="testSession"
                  label="Use test sessions instead of recorded"
                ></v-checkbox>
              </v-col>
              <v-col cols="8" class="pr-2">
                <v-text-field 
                  v-model="inputMessage"
                  clearable 
                  label="Debug Message" 
                  variant="solo-filled"
                  full-width
                />
              </v-col>
              <v-col cols="2">
                <v-btn @click="sendMessage" block>
                  Send
                </v-btn>
              </v-col>
            </v-row>
            <v-checkbox
              v-model="shouldMirror"
              label="Mirror input">
            </v-checkbox>
          </v-card>
        </v-col>
      </v-row>
    </v-expansion-panel-text>
  </v-expansion-panel>
</v-expansion-panels>

  </v-container>
  </MainLayout>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import MainLayout from '/src/layout/MainLayout.vue';

export default {
  name: 'Calibration',
  components: {
    MainLayout,
  },
  data() {
    return {
      shouldMirror: false,
      items: [
        { name: 'backwall', value: 'backWall',descr: 'default' },
        { name: 'ground', value: 'ground', descr: 'experimental' },
      ],
      placement: null,
      rows: 4,
      cols: 5,
      squareSize: 35,
      inputMessage: '', // For Debug
    };
  },
  computed: {
    ...mapState({
      connectionStatus: 'connectionStatus',
      clientsCount: 'clientsCount',
      receivedMessage: 'receivedMessage',
      BASEURL: state => state.BASEURL,
      sessionID: state => state.sessionID,
      cameras: state => state.sessionCameras,
      uploadedVideos: state => state.uploadedVideos,
    }),
    ...mapState('data', {
      calibrated: state => state.calibrated,
    }),
    rightButtonText() {
      return this.calibrated ? 'Continue' : 'Calibrate';
    },
    testSession: {
      get() {
        return this.$store.state.data.test_session;
      },
      set(value) {
        this.setTestSession(value);
      },
    },
  },
  watch: {
    calibrated(isIt) {
      if (isIt) {
        console.log('Extrinsincs are calibrated!')
        //this.$router.push(`/${this.sessionID}/neutral`);
      }
    },
    uploadedVideos(newValue){
      if (newValue == this.cameras){
        this.$store.commit('RESET_UPLOADED_VIDEOS')
        console.log("READY TO CALIBRATE :)")
        this.triggerToast({toastType: "Info", message: "All videos uploaded"})
        const processCalibrationMsg = {
          command: "process_trial",
          trialType: "calibration",
          trialId: "calibration",
          trialName: "calibration",
          session: this.sessionID,
          isTest: this.testSession,
          shouldMirror: this.shouldMirror,
        }
        this.sendMessage(JSON.stringify(processCalibrationMsg))
      }
    }
  },
  created() {
    this.placement = this.items[0].values;
    this.testSession= false
  },
  mounted() {
    console.log(`SessionID is: ${this.sessionID}`);
    console.log(`Number of cameras is: ${this.cameras}`);
    //this.$store.commit('data/SET_CALIBRATED', false)
  },
  methods: {
    ...mapActions(['sendMessage', 'getBASEURL', 'triggerToast']),
    ...mapMutations('data', {
      setTestSession: 'SET_TEST_SESSION',
    }),
    onNext() {
      console.log('onNext pressed');
      console.log(this.placement);
      const isDebug = (this.cameras == 0 && this.testSession && !this.calibrated)
      console.log(`is this debug: ${this.cameras == 0}, ${this.testSession}, ${!this.calibrated} total: ${(this.cameras == 0 && this.isTest && !this.calibrated)}`)
      if (this.cameras == 0 && this.testSession && !this.calibrated){ // for debugging when no phones are connected
        const calibMessage = {
          session: this.sessionID,
          command: "process_trial",
          trialType: "calibration",
          trialName: "calibration",
          trialId: "calibration",
          rows: this.rows,
          cols: this.cols,
          squareSize: this.squareSize,
          placement: this.placement,
          isTest: true,
        }
          this.sendMessage(JSON.stringify(calibMessage))
      }
      else if (!this.calibrated){
        console.log(this.placement)
        // Send message to start recording the calibration videos.
        const calibMessage = {
          session: this.sessionID,
          command: 'start_recording',
          trialType: "calibration",
          trialId: "calibration",
          trialName: "calibration",
          rows: this.rows,
          cols: this.cols,
          squareSize: this.squareSize,
          placement: this.placement,
          isTest: this.testSession
        };

        console.log(JSON.stringify(calibMessage));
        this.sendMessage(JSON.stringify(calibMessage)
    
        );
      } // Move to the next route after calibration
      else if (this.calibrated) {
        this.$router.push(`/${this.sessionID}/neutral`);
      }
      
      
    },
  },
};
</script>

<style scoped>
/* Make all rows share equal height */
.row-equal {
  flex: 1;
  display: flex;
}

/* Debug row smaller height */
.debug-row {
  flex: 0.3;
}

/* Image scaling */
.checkerboard-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Ensure the container fills space */
v-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}


</style>