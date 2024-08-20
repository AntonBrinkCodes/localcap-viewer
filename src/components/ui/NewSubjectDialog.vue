<template>
    <v-dialog v-model="edit_dialog" width="500" persistent @click:outside="closeDialog">
      <form @submit.prevent="submitSubjectForm" class="d-flex flex-column">
        <v-card>
          <v-card-title class="headline" v-if="edited_subject.id">Edit subject "{{ edited_subject.name }}"</v-card-title>
          <v-card-title class="headline" v-else>Create new subject</v-card-title>
          <v-card-text class="pt-4">
            <v-text-field
              v-model="edited_subject.name"
              label="Name"
              required
              :error="formErrors.name != null"
              :error-messages="formErrors.name"
            ></v-text-field>
  
            <Field name="Weight" rules="required|weightRule" v-slot="{ field, meta }">
              <v-text-field
                v-bind="field"
                v-model="edited_subject.weight"
                label="Weight (kg)"
                type="number"
                hide-spin-buttons
                required
                :error="meta.invalid"
                :error-messages="meta.errors"
              ></v-text-field>
            </Field>
  
            <Field name="Height" rules="required|heightRule" v-slot="{ field, meta }">
              <v-text-field
                v-bind="field"
                v-model="edited_subject.height"
                label="Height (m)"
                type="number"
                hide-spin-buttons
                required
                :error="meta.invalid"
                :error-messages="meta.errors"
              ></v-text-field>
            </Field>
  
            <Field name="Birth Year" rules="required|birthYearRule" v-slot="{ field, meta }">
              <v-text-field
                v-bind="field"
                v-model="edited_subject.birth_year"
                label="Birth year (yyyy)"
                type="number"
                hide-spin-buttons
                required
                :error="meta.invalid"
                :error-messages="meta.errors"
              ></v-text-field>
            </Field>
  
            <Field name="Subject Tags" rules="required|subjectTagsRule" v-slot="{ field, meta }">
              <v-select
                v-bind="field"
                clearable
                multiple
                v-model="edited_subject.subject_tags"
                item-title="text"
                item-value="value"
                label="Subject Tags"
                :items="tagsOptions"
                :error="meta.invalid"
                :error-messages="meta.errors"
              ></v-select>
            </Field>
  
            <v-select
              ref="sexAtBirthSelect"
              clearable
              v-model="edited_subject.sex_at_birth"
              item-title="text"
              item-value="value"
              label="Sex assigned at birth (Optional)"
              :items="sexesOptions"
            ></v-select>
            <v-select
              ref="genderSelect"
              clearable
              v-model="edited_subject.gender"
              item-title="text"
              item-value="value"
              label="Gender (Optional)"
              :items="gendersOptions"
            ></v-select>
  
            <v-textarea
              v-model="edited_subject.characteristics"
              label="Characteristics (Optional)"
              rows="3"
            ></v-textarea>
  
            <div class="pt-0">
              <Field :rules="{ required: {allowFalse: false}}" v-slot="{ field, meta }" name="Informed consent selection">
                <v-checkbox v-model="edited_subject.terms" class="mt-0 mb-0"
                            :error="meta.invalid"
                            :error-messages="meta.errors">
                  <template v-slot:label>
                    <div>I, the research Participant, have provided informed consent to the research Investigator conducting this study.
                      I have read and I agree to the
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <a href="https://www.opencap.ai/terms-conditions"
                             target="_blank"
                             v-bind="props"
                             @click.stop>Terms and Conditions</a>
                        </template>
                        Opens in new window
                      </v-tooltip>
                      and
                      <v-tooltip location="bottom">
                        <template v-slot:activator="{ props }">
                          <a href="https://docs.google.com/document/d/1DBw9LVAuUwgz713037VQjsaD8sj2-AN_hzga_7kXtXI"
                             target="_blank"
                             v-bind="props"
                             @click.stop>Privacy Policy</a>
                        </template>
                      </v-tooltip>
                      of the OpenCap tool.
                    </div>
                  </template>
                  Opens in new window
                </v-checkbox>
              </Field>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="cancelSubjectForm()">Cancel</v-btn>
            <v-btn color="green darken-1" text :disabled="form.invalid" @click="submitSubjectForm">Save</v-btn>
          </v-card-actions>
        </v-card>
      </form>
    </v-dialog>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  import { useForm, Form, Field, ErrorMessage } from 'vee-validate';
  import { rules } from '@/validation';
  
  export default {
    name: 'NewSubjectDialog',
    components: {
        Form,
        Field,
        ErrorMessage,
        rules
    },
    setup() {
      const form = useForm(); // Initialize the form validation
      const openDialog = () => {
        this.edit_dialog = true;
        this.edited_subject = { ...this.empty_subject };
        this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null,
          //subject_tags: null
        };
        console.log('add subject');
      }
      return { form, openDialog };

      
    },
    data() {
      return {
        rules,
        edit_dialog: false,
        edited_subject: {
          id: '',
          name: '',
          weight: '',
          height: '',
          birth_year: '',
          sex_at_birth: '',
          gender: '',
          //subject_tags: null,
          characteristics: ''
        },
        empty_subject: {
          id: '',
          name: '',
          weight: '',
          height: '',
          birth_year: '',
          sex_at_birth: '',
          gender: '',
          //subject_tags: null,
          characteristics: ''
        },
        formErrors: {
          name: null,
          weight: null,
          height: null,
          birth_year: null,
          //subject_tags: null
        },
      };
    },
    computed: {
      ...mapState({
        sessions: state => state.data.sessions,
        genders: state => state.data.genders,
        subjectTags: state => state.data.subjectTags,
        sexes: state => state.data.sexes
      }),
      gendersOptions() {
        return Object.entries(this.genders).map(s => ({ text: s[1], value: s[0] }));
      },
      tagsOptions() {
        return Object.entries(this.subjectTags).map(s => ({ text: s[1], value: s[0] }));
      },
      sexesOptions() {
        return Object.entries(this.sexes).map(s => ({ text: s[1], value: s[0] }));
      }
    },
    mounted() {
      console.log('SubjectDialog mounted');
      //this.loadSubjectTags
    },
    methods: {
      ...mapActions('data', ['loadSubjects', 'loadSubjectTags']),
      closeDialog() {
        if (
          this.$refs.subjectTagsSelect.isMenuActive ||
          this.$refs.sexAtBirthSelect.isMenuActive ||
          this.$refs.genderSelect.isMenuActive
        )
          this.edit_dialog = true;
        else this.edit_dialog = false;
      },
      async cancelSubjectForm() {
        this.edit_dialog = false;
        this.edited_subject = { ...this.empty_subject };
        this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null,
          subject_tags: null
        };
      },
      async submitSubjectForm() {
        this.edit_dialog = false;
  
        /*if (!this.edited_subject.subject_tags || this.edited_subject.subject_tags.length === 0) {
          this.edit_dialog = true;
          this.formErrors.subject_tags = [
            "You must add at least one subject tag. For subjects with no conditions, select 'Unimpaired'."
          ];
          return;
        }*/
  
        this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null,
          //subject_tags: null
        };
  
        console.log('edit_dialog=', this.edit_dialog);
        // Uncomment and update with your API call
        /*if (this.edited_subject.id) {
          try {
            const response = await axios.put('/subjects/' + this.edited_subject.id + '/', this.edited_subject);
            this.$emit('subject-updated', response.data);
            this.clearEditedSubject();
          } catch (error) {
            if (error.response.status === 400) {
              for (const [key, value] of Object.entries(error.response.data)) {
                this.formErrors[key] = value;
              }
              this.edit_dialog = true;
            }
          }
        } else {
          try {
            const response = await axios.post('/subjects/', this.edited_subject);
            this.$emit('subject-added', response.data);
            this.clearEditedSubject();
          } catch (error) {
            if (error.response.status === 400) {
              for (const [key, value] of Object.entries(error.response.data)) {
                this.formErrors[key] = value;
              }
              this.edit_dialog = true;
            }
          }
        }*/
  
        console.log('edit_dialog=', this.edit_dialog);
        // await this.loadSubjects();
      },
      clearEditedSubject() {
        this.edited_subject = { ...this.empty_subject };
      },
      async addSubject() {
        this.edit_dialog = true;
        this.edited_subject = { ...this.empty_subject };
        this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null,
          //subject_tags: null
        };
        console.log('add subject');
      }
    }
  };
  </script>
  