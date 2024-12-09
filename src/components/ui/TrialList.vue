<template>
  <div>
    <h1>Session Trials</h1>
    <ul>
      <li 
        v-for="trial in trials" 
        :key="trial.trialName" 
        class="trial-item"
        :class="{ selected: trial === selectedTrial }"
        @click="onTrialClick(trial)"
      >
        <span class="trial-name">{{ trial.trialName }}</span>
        <span 
          class="status-indicator"
          :class="{ 'processed': trial.processed, 'unprocessed': !trial.processed }"
        ></span>
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
  emits: ["trial-click"],
  methods: {
    onTrialClick(trial) {
      this.selectedTrial = trial; // Mark the clicked trial as selected
      this.$emit("trial-click", trial); // Emit the selected trial to the parent
    },
  },
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

.trial-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 5px;
  border: 1px solid transparent; /* Default border */
  transition: all 0.3s;
}

.trial-item:hover {
  background-color: #f0f0f0;
}

.trial-item.selected {
  border: 1px solid #1976d2; /* Highlight border for selected trial */
  background-color: #525252; /* Highlight background for selected trial */
}

.trial-name {
  flex: 1;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.status-indicator.processed {
  background-color: green;
}

.status-indicator.unprocessed {
  background-color: yellow;
}
</style>
