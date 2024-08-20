<template>
    <MainLayout
        column
        leftButton="Back"
        rightButton="Record Neutral"
        :step="4"
        :rightDisabled="this.cameras>=2" 
        @left="this.$router.push(`/${this.sessionID}/calibration`)"
        @right="onNext">
    
    
        <v-card class="mb-4">
    <v-card-title class="justify-center subject-title">
      Session Info
    </v-card-title>
    <v-card-text>
      <v-row >
        <v-col cols="11">
          <v-autocomplete
            ref="selectSubjectsRef"
            required
            v-model="subject"
            item-title="name"
            item-value="id"
            label="Subject"
            :items="loaded_subjects"
            :loading="subject_loading"
            :search-input.sync="subject_search"
            return-object
          >
            <template v-slot:append-item>
              <div v-intersect="loadNextSubjectsListPage" />
            </template>
            <template v-slot:selection>{{ subject.name }}</template>
          </v-autocomplete>
        </v-col>
        <v-col>
            <v-btn>
                <v-icon icon="mdi-plus" />
            </v-btn>
                   
        </v-col>
       
      </v-row>
      
      <v-row class="mt-3"> <!-- Added this row -->
        <v-col cols="11">
          <v-text-field
            v-model="sessionName"
            label="Session Name (optional)"
            type="text"
            required
            :error="formErrors.name != null"
            :error-messages="formErrors.name"
          ></v-text-field>
        </v-col>
      </v-row>

    </v-card-text>
  </v-card>

    
      
    </MainLayout>
<NewSubjectDialog
        v-if="showNewSubjectDialog"
            @close-dialog="showNewSubjectDialog = false"
        />


</template>



<script>
import { ref } from 'vue'
import { mapState } from 'vuex'
import MainLayout from '/src/layout/MainLayout.vue'
import NewSubjectDialog from '@/components/ui/NewSubjectDialog.vue'

export default {
    name: 'Neutral',
    components: {
        MainLayout,
        NewSubjectDialog
    },
    created() {
        this.loadSubjectsList(false)
    },
    data() {
        return {
            formErrors: {
                name: null,
                weight: null,
                height: null,
                birth_year: null,
                data_sharing_agreement: null,
                subject_tags: null,
            },
            sessionName: '',
            subject: null,
            subject_loading: false,
            loaded_subjects: [],
            subject_query: "",
            showNewSubjectDialog: false,
        };
    },
    computed: {
        ...mapState({
            sessionID: state => state.sessionID,
            cameras: state => state.cameras,
        }),
        ...mapState('data', {
            subjects: state => state.subjects,
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
        }
    },
    methods: {
        onNext() {
            console.log('onNext pressed');
            //this.loadSubjectsList(false);
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
                command: 'get_subjects'
            };
            this.$store.dispatch('sendMessage', {
                message: JSON.stringify(subjectsMsg)
            });
        },
        openNewSubjectPopup() {
            this.showNewSubjectDialog = true;
         },
        loadNextSubjectsListPage() {
            // Implement logic to load the next page of subjects
        },
        submitAddSubject (data) {
            console.log('submitAddSubject', data)
            let obj = {
                id: data.id,
                display_name: `${data.name} (${data.mass} Kg, ${data.height} m, ${data.birth_year})`,
            }
            this.loaded_subjects.push(obj)
            this.subject = obj
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

//.data-title {
//  padding-bottom: 7px;
//}
</style>