<template>
  <v-dialog v-model="internalVisible" persistent max-width="600">
    <v-card>
      <v-card-title class="text-h6">
        Reprocess Trial: {{ item.trialName }}
      </v-card-title>

      <v-card-subtitle class="text-caption text-red-600">
        ⚠️ Work in Progress – Feature not fully implemented
      </v-card-subtitle>

      <v-divider class="my-2" />

      <v-card-text>
        <!-- Camera Selection -->
        <section class="mb-4">
          <h3 class="font-semibold mb-2">Select Cameras:</h3>
          <v-row dense>
            <v-col
              v-for="camIndex in Array.from({ length: cameraCount }, (_, i) => i)"
              :key="camIndex"
              cols="6" sm="4" md="3"
            >
              <v-checkbox
                :label="'Camera ' + camIndex"
                :value="'Cam' + camIndex"
                v-model="selectedCameras"
                hide-details
                dense
              />
            </v-col>
          </v-row>
        </section>

        <v-divider class="my-4" />

        <!-- Pose Estimation -->
        <section class="mb-4">
          <h3 class="font-semibold mb-2">Pose Estimation Model:</h3>
          <v-select
            v-model="poseModel"
            :items="['openpose', 'hrnet']"
            label="Model"
            dense
            hide-details
          />
        </section>

        <!-- Resolution (Only for OpenPose) -->
        <section v-if="poseModel === 'openpose'" class="mb-4">
          <h3 class="font-semibold mb-2">OpenPose Resolution:</h3>
          <v-select
            v-model="resolution"
            :items="['1x368', '1x736', '1x736_2scales', '1x1008', '1x1008_4scales']"
            label="Resolution"
            dense
            hide-details
          />
        </section>

        <v-divider class="my-4" />

        <!-- Force Redo -->
        <v-checkbox
          v-model="forceRedo"
          label="Force redo pose estimation"
          hide-details
          dense
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant ="outlined" @click="emitClose">Cancel</v-btn>
        <v-btn variant ="outlined" @click="submit">Reprocess</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>



<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  item: Object,
  cameraCount: Number
})
const emit = defineEmits(['close', 'reprocess'])

const selectedCameras = ref([])
const poseModel = ref('hrnet')
const resolution = ref('1x736')
const forceRedo = ref(false)
const internalVisible = ref(props.visible)

// Watch visibility and reset form
watch(() => props.visible, val => {
  internalVisible.value = val
  if (val) resetForm()
})

watch(internalVisible, val => {
  if (!val) emit('close')
})

function resetForm() {
  selectedCameras.value = Array.from({ length: props.cameraCount }, (_, i) => 'Cam' + (i))
  poseModel.value = 'hrnet'
  resolution.value = '1x736'
  forceRedo.value = false
}

const finalCameras = computed(() => {
  if (selectedCameras.value.length === props.cameraCount) {
    return ['all']
  }
  return selectedCameras.value
})

function submit() {
  emit('reprocess', {
    item: props.item,
    cameras: finalCameras.value,
    poseModel: poseModel.value,
    resolution: poseModel.value === 'openpose' ? resolution.value : null,
    forceRedo: forceRedo.value
  })
  emit('close')
}

function emitClose() {
  emit('close')
}

</script>
