<template>
  <div>
    <h2>Trials</h2>
    <ul>
      <li 
        v-for="trial in trials" 
        :key="trial.trialName" 
        class="trial-item"
        :class="{ selected: trial === selectedTrial }"
        @click="onTrialClick(trial)"
      >
        <!-- Trial Details -->
        <div class="trial-details" >
          <span class="trial-name align-center">{{ trial.trialName }}</span>
          <span 
            class="status-indicator align-center"
            :class="{ 
              'processed': trial.processed === 'True', 
              'error': trial.processed === 'Error', 
              'unprocessed': trial.processed !== 'True' && trial.processed !== 'Error' 
            }"
          ></span>
          <button 
            class="hamburger-button" 
            @click.stop="onHamburgerClick(trial)"
            title="Reprocess Options"
          >
            ☰
          </button>
        </div>

        <!-- Loader Container -->
        <div class="loader-container">
          <v-progress-linear 
            v-if="trial.processed === 'processing' || trial.processed === 'queued'" 
            :color="trial.processed === 'processing' ? 'green' : 'yellow'"
            height="4"
            indeterminate
            class="status-loader"
          ></v-progress-linear>
        </div>
      </li>
    </ul>
  </div>
</template>



<script>
export default {
  name: "TrialList",
  props: {
    trials: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedTrial: null, // Store the currently selected trial
    };
  },
  emits: ["trial-click", "hamburger-click"],
  methods: {
    onTrialClick(trial) {
      this.selectedTrial = trial; // Mark the clicked trial as selected
      this.$emit("trial-click", trial); // Emit the selected trial to the parent
    },
    onHamburgerClick(trial) {
      this.$emit("hamburger-click", trial);
    },
  },
};
</script>

<style scoped>
/* General Styles */
ul {
  list-style-type: none;
  padding: 0;
  overflow: auto;
}

.hamburger-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
  color: #333;
  transition: color 0.2s;
}

.hamburger-button:hover {
  color: #1976d2;
}

.trial-item {
  display: flex;
  flex-direction: column; /* Stack content horizontally */
  justify-content: space-between; /* Push items to top and bottom */
  align-items: flex-start; /* Center content horizontally */
  margin-bottom: 10px;
  cursor: pointer;
  padding: 5px;
  border: 1px solid transparent; /* Default border */
  transition: all 0.3s;
  min-height: 60px; /* Ensure consistent height with/without loader */
  position: relative; /* Allows positioning the loader at the bottom */
}

.trial-item:hover {
  background-color: #b1aeae;
}

.trial-item.selected {
  border: 1px solid #1976d2; /* Highlight border for selected trial */
  background-color: #525252; /* Highlight background for selected trial */
}

/* Trial Details Section (Center Content) */
.trial-details {
  display: flex;
  flex-direction: row; /* Stack name and indicator vertically */
  justify-content: space-between; /* */
  align-items: center; /* Horizontally center the content */
  width: 100%; /* Allow the details section to take up available space */
}

.trial-name {
  font-weight: bold;
  flex: 1;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-top: 5px; /* Space between name and indicator */
}

.status-indicator.processed {
  background-color: green;
}

.status-indicator.unprocessed {
  background-color: yellow;
}

.status-indicator.error {
  background-color: red;
}

/* Loader Styles */
.loader-container {
  width: 100%; 
  height: 10px; /* Fixed space for the loader */
  margin-top: 10px;
}

.status-loader {
  animation-duration: 4s !important; /* Slow down loader animation */
}
</style>


