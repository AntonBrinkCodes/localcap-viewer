<template>
    <div>
      <h1>Session Trials</h1>
      <ul>
        <li 
          v-for="trial in trials" 
          :key="trial.trialName" 
          class="trial-item"
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
    emits: ["trial-click"],
    methods: {
      onTrialClick(trial) {
        this.$emit("trial-click", trial);
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
  