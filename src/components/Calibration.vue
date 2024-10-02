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
    <v-card class="step-2-2 mt-4 flex-grow-1 pa-4">
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
            <img src="../assets/images/big_good_triangle.jpg" class="img-fluid" alt="Checkerboard Placement" style="max-width: 50%; height: auto;" />
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="step-2-2 mt-4 flex-grow-1 pa-4">
      <v-row class="align center">
        <v-col cols="6" class="pr-4">
          <v-card-title class="align-center">Provide the checkerboard details</v-card-title>

          <v-card-text class="d-flex align-center">
            <div class="d-flex flex-grow-1 align-center inputs">
              <v-text-field v-model="rows" label="Rows" class="mr-3" />
              <v-text-field v-model="cols" label="Columns" class="mr-3" />
              <v-text-field v-model="squareSize" label="Square size (mm)" />
              <v-select 
                v-model="placement"
                :items="items"
                item-title="name"
                label="Placement"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="item.descr"></v-list-item>
                </template>
              </v-select>
            </div>
          </v-card-text>
        </v-col>

        <v-col cols="6" class="pr-4">
          <div class="image-container text-center">
            <img src="/src/assets/images/checkerboard_45.png" class="img-fluid" style="max-width: 50%; height: auto;" />
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Debug Section -->
    <v-card-text class="step-2-2 mt-4 flex-grow-1 p-0" style="width: 100%;">
      <v-card-title class="justify-center">DEBUG:</v-card-title>

      <!-- Input Field and Button in a Row -->
      <v-row class="mt-4" no-gutters>
        <v-col cols="2">
          <v-checkbox
            v-model="testSession"
            label="Use test sessions instead of recorded"
          ></v-checkbox>
        </v-col>
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
          <v-btn @click="sendMessage" block style="height: 56px;">
            Send
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
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
      items: [
        { name: 'backwall', descr: 'default' },
        { name: 'ground', descr: 'experimental' },
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
  },
  created() {
    this.placement = this.items[0].name;
    this.testSession= false
  },
  mounted() {
    console.log(`SessionID is: ${this.sessionID}`);
    console.log(`Number of cameras is: ${this.cameras}`);
  },
  methods: {
    ...mapActions(['sendMessage', 'getBASEURL']),
    ...mapMutations('data', {
      setTestSession: 'SET_TEST_SESSION',
    }),
    onNext() {
      console.log('onNext pressed');
      console.log(this.placement);
      if (!this.calibrated){
        // run calibration
        const calibMessage = {
          session: this.sessionID,
          command: 'start_calibration',
          rows: this.rows,
          cols: this.cols,
          squareSize: this.squareSize,
          placement: this.placement,
          isTest: this.testSession
        };

        console.log(JSON.stringify(calibMessage));
        this.sendMessage({
          message: JSON.stringify(calibMessage),
          session_id: this.sessionID,
        });
      }
      // Move to the next route after calibration
      else if (this.calibrated) {
        this.$router.push(`/${this.sessionID}/neutral`);
      }
    },
  },
};
</script>

<style lang="scss">
.step-2-1 li {
  font-size: 24px;

  &:not(:last-child) {
    margin-bottom: 24px;
  }
}

.step-2-2 .inputs > * {
  flex: 0 0 150px;
}
</style>
