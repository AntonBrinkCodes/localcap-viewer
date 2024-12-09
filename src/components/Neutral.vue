<template>
  <MainLayout leftButton="Back" 
  :rightButton="rightButtonText" 
  :step="4" 
  :rightDisabled="this.subject === null "
  @left="this.$router.push(`/${this.sessionID}/calibration`)" 
  @right="onNext">

    <div class="step-4-1 d-flex flex-column">

      <v-card class="mb-4">
        <v-card-title class="justify-center subject-title">
          Session Info
        </v-card-title>
        <v-card-text>
          <v-row align="stretch">

            <v-col cols="11">
              <v-autocomplete ref="selectSubjectsRef" required v-model="subject" item-title="name" item-value="id"
                label="Subject" :items="loaded_subjects" :loading="subject_loading" :search-input.sync="subject_search"
                return-object>
                <template v-slot:append-item>
                  <div v-intersect="loadNextSubjectsListPage" />
                </template>
                <template v-slot:selection>{{ subject.name }}</template>
              </v-autocomplete>
            </v-col>
            <v-col cols="1">
              <v-btn icon @click=openNewSubjectPopup(true)>
                <v-icon icon="mdi-plus" />
              </v-btn>
            </v-col>

          </v-row>

          <v-row class="mt-3"> <!-- Added this row -->
            <v-col cols="11">
              <v-text-field v-model="sessionName" label="Session Name (optional)" type="text" required
                :error="formErrors.name != null" :error-messages="formErrors.name"></v-text-field>
            </v-col>
          </v-row>

        </v-card-text>
      </v-card>

      <v-card class="mb-4">
        <div class="d-flex justify-center">
          <v-card-title class="justify-center data-title">
            Data sharing agreement
          </v-card-title>

          <v-btn icon><v-icon icon="mdi-help-circle-outline" />
            <v-tooltip activator="parent" location="bottom">The information on this page as well as videos of your
              movement
              are
              uploaded to your own computer / where you host the local backend.
              Remember to get informed consent and ask your patient about data sharing.</v-tooltip>
          </v-btn>

        </div>
        <v-card-text class="d-flex flex-column align-left checkbox-wrapper">
          <div class="d-flex flex-column checkbox-box">
            <v-checkbox v-model="data_sharing_0" @click="isInputValid" :label="labelText" :rules="[checkboxRule]"
              required></v-checkbox>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-center">
        <div class="text-center">
          <v-btn color="primary-dark" class="mt-4 mb-4 ml-4 mr-4" x-large @click="isInputValid">
            Advanced Settings
            <v-tooltip activator="parent" location="bottom">
              TO BE IMPLEMENTED
            </v-tooltip>
          </v-btn>
        </div>
      </div>

      <!-- Include the Dialog component -->
    <NewSubjectDialog v-model="showDialog" :_closeDialog="openNewSubjectPopup" :onSave="submitAddSubject"
      @subject-updated="handleSubjectUpdated" />

    <!-- Debug Section -->
    <v-card-text class="step-2-2 mt-4 flex-grow-1 p-0" style="width: 100%;">
      <v-card-title class="justify-center">DEBUG:</v-card-title>

      <!-- Input Field and Button in a Row -->
      <v-row class="mt-4" no-gutters>
        <v-col cols="2">
          <v-checkbox v-model="testSession" label="Use test sessions instead of recorded"></v-checkbox>
        </v-col>
        <v-col cols="18" class="pr-2">
          <v-text-field v-model="inputMessage" clearable label="Debug Message" variant="solo-filled" full-width
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


    </div>

    <v-card class="step-4-2 ml-4 d-flex images-box">

      <v-card class="mb-0">
        <v-card-text style="padding-top: 5px; padding-bottom: 0; font-size: 16px;">
          <p>{{ uploadedVideosCount }} of {{ this.cameras }} videos uploaded</p>
        </v-card-text>
      </v-card>

      <v-card-title class="justify-center">
        Record neutral pose
      </v-card-title>
      <v-card-text class="d-flex justify-center align-center">
        <div class="d-flex flex-column mr-4">
          <ul>
            <li>
              The subject should adopt the example neutral pose
              <ul>
                <li class="space-above-small">Upright standing posture with feet pointing forward</li>
                <li class="space-above-small">Straight back and no bending or rotation at the hips, knees, or ankles
                </li>
              </ul>
            </li>
            <li class="space-above-small">The subject should stand still</li>
            <li class="space-above-small">
              The subject should be visible by all cameras
              <ul>
                <li class="space-above-small">Nothing in the way
                  of cameras view when hitting Record</li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="d-flex flex-column align-center ">
          <span class="sub-header" style="font-size: 18px;">Example neutral pose</span>
          
          <ExampleImage :image="imageSrc" :width="256" :height="341" good />
        </div>
      </v-card-text>
     <!-- <v-card-title class="justify-center" style="font-size: 18px; word-break: break-all;">
        If the subject cannot adopt the example neutral pose, select "Any pose" scaling setup under Advanced Settings
      </v-card-title> -->

      <div class="d-flex justify-center">
        <div class="text-center">
          <v-btn color="primary-dark" class="mt-4 mb-4 ml-4 mr-4" x-large
            @click="this.$router.push(`/${this.sessionID}/dynamic`)">
            Go to Dynamic
            <v-tooltip activator="parent" location="bottom">
              Dynamic part is WIP
            </v-tooltip>
          </v-btn>
        </div>
      </div>

    </v-card>



    

  </MainLayout>



</template>



<script>
import { ref, watch } from 'vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import MainLayout from '/src/layout/MainLayout.vue'
import NewSubjectDialog from './ui/NewSubjectDialog.vue'
import ExampleImage from './ui/ExampleImage.vue';
import { NIL, v4 as uuidv4 } from "uuid";
import bigGoodTriangle from '../assets/images/big_good_triangle.png';



export default {
  name: 'Neutral',
  components: {
    MainLayout,
    NewSubjectDialog,
    ExampleImage
  },
  created() {
    this.loadSubjectsList(false)
    const pingmsg = {
      command: "ping"
    }
    this.sendMessage(JSON.stringify(pingmsg)
    )
  },
  data() {
    return {
      showDialog: false,
      formErrors: {
        name: null,
        weight: null,
        height: null,
        birth_year: null,
        data_sharing_agreement: null,
        subject_tags: null,
      },
      imageSrc: bigGoodTriangle,
      sessionName: '',
      subject: null,
      subject_loading: false,
      loaded_subjects: [],
      subject_query: "",
      showNewSubjectDialog: false,
      data_sharing_0: false,
      labelText: 'The subject acknowledges that the recorded videos and processed data will be stored in the manner you have chosen locally. The subject has been fully informed of the storage method and has provided consent for the use of their recordings in accordance with the agreed-upon purposes.',
    };
  }, watch: {
    showDialog(newValue) {
      console.log(newValue)
    }
  },
  computed: {
    ...mapState({
      sessionID: state => state.sessionID,
      cameras: state => state.sessionCameras,
      uploadedVideosCount: state => state.uploadedVideos,
    }),
    ...mapState('data', {
      subjects: state => state.subjects,
      isTest: state => state.test_session,
      neutralPose: state => state.neutralPose
    }),
    subject_search: {
      get() {
        return this.subject_query;
      },
      set(value) {
        if (value !== null) {
          this.subject_query = value;
          this.subject_start = 0;
          this.loadSubjectsList(false);
        }
      }
    },
    testSession: {
      get() {
        return this.$store.state.data.test_session;
      },
      set(value) {
        this.setTestSession(value);
      },
    },
    rightButtonText() {
      return this.neutralPose ? 'Continue' : 'Calibrate';
    },
  },
  watch: {
    subjects(newSubjectList) {
      newSubjectList.forEach(subject => {
        console.log('new subject is: ', subject.name, 'weight is: ', subject.mass, 'height is: ', subject.height, 'gender is: ', subject.gender);
      });

      console.log(`new subject list: ${newSubjectList}`);
      this.loaded_subjects = newSubjectList;
      this.subject_loading = false;
      console.log(this.loaded_subjects);
    },
    uploadedVideosCount(newAmount) {
      if (newAmount == this.cameras) {
        // Send to server to actually process it.
        const processTrialMsg = {
          command: "process_trial",
          trialType: "neutral",
          trialname: "neutral",
          trialId: "neutral",
          subject: this.subject,
          isTest: this.isTest,
          session: this.sessionID

        }
        this.sendMessage(JSON.stringify(processTrialMsg))
      }
    },
  },
  methods: {
    ...mapActions(['sendMessage']),
    ...mapMutations('data', {
      setTestSession: 'SET_TEST_SESSION',
    }),
    onNext() {
      //TODO: Add so that if neutralPose is true then this just routes to dynamic.
      console.log('onNext pressed');
      //this.loadSubjectsList(false);
      console.log('is this a test run? :', this.isTest)
      console.log(this.sessionID)
      
      this.$store.commit('RESET_UPLOADED_VIDEOS')
      const isDebug = (this.cameras == 0 && this.testSession && !this.neutralPose)
      console.log(`is this debug: ${this.cameras == 0}, ${this.testSession}, ${!this.calibrated} total: ${(this.cameras == 0 && this.isTest && !this.neutralPose)}`)
      if (this.cameras === 0 && this.isTest && !this.neutralPose) {
        // debug trial
        const processneutralMsg = {
          command: "process_trial",
          trialType: "neutral",
          trialId: "neutral", 
          subject: this.subject,
          isTest: true,
          session: this.sessionID,
        }
        this.sendMessage(JSON.stringify(processneutralMsg))
    }
      else if (!this.neutralPose) {
      const startNeutralMsg = {
        command: "start_recording",
        trialType: "neutral",
        trialId: "neutral",
        trialname: "neutral", 
        subject: this.subject,
        isTest: this.isTest,
        session: this.sessionID,
      }
      this.sendMessage(
        JSON.stringify(startNeutralMsg),
      );}
      else { // Move to next 
      this.$router.push(`/${this.sessionID}/dynamic`)
    }
    
    
    },
    async loadSubjectsList(append_result = false) {
      console.log('loading subjects:', this.subject_search, ' - ', append_result);
      console.log('subject=', this.subject);

      this.subject_loading = true;
      let data = {
        search: this.subject_search,
        start: this.subject_start,
        quantity: 40,
        simple: 'true'
      };
      // Something to search in data stores list of Subjects :/
      // For now, this sends a message to get the subjects from server and puts that into this.
      const subjectsMsg = {
        command: 'get_subjects',
      };
      this.$store.dispatch('sendMessage', 
        JSON.stringify(subjectsMsg)
      );
    },
    openNewSubjectPopup(value) {
      this.showDialog = value;
    },
    loadNextSubjectsListPage() {
      // Implement logic to load the next page of subjects
    },
    handleSubjectUpdated() {
      // Implement this
    },
    saveSubjectToServer(subject) {
      const savesubjMsg = {
        command: 'save_subject',
        content: subject
      }
      this.$store.dispatch('sendMessage', 
        JSON.stringify(savesubjMsg)
      );
    },
    submitAddSubject(data) {
      console.log('submitAddSubject', data)
      let obj = {
        id: uuidv4(),
        name: data.name,
        mass: data.mass,
        height: data.height,
        gender: data.gender,
        birth_year: data.birth_year,

      }
      this.loaded_subjects.push(obj)
      this.subject = obj

      this.saveSubjectToServer(this.subject)
    },
    isInputValid() {
      if (this.checkboxRule(this.data_sharing_0) === true) {
        console.log('All inputs are valid.');
      } else {
        console.log('Please check the checkbox.');
      }
    },
    checkboxRule(value) {
      return value ? true : 'You must agree to continue';
    },
  }
}
</script>


<style lang="scss">
.step-4-1 {
  flex: 0 0 50%;

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

//.subject-title {
//  padding-bottom: 0;
//}

.images-box {
  display: flex;
  flex-direction: column;
  height: fit-content;

  ul {
    font-size: 16px;
  }
}

//.checkbox-wrapper {
//  padding-top: 0;
//}

.checkbox-box>div {
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
  margin-top: 15px;
  /* Adjust the value as needed */
}

.space-above-large {
  margin-top: 20px;
  /* Adjust the value as needed */
  font-size: 20px;
  /* Adjust the font size as needed */
  font-weight: bold;
}

//.data-title {
//  padding-bottom: 7px;
//}</style>