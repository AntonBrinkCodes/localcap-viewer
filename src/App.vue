<template>
    <div id="app">
      <router-view></router-view>
    </div>

    <nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/vizualiser">Go to vizualiser</RouterLink>
  </nav>
  </template>
  
  <script>
  export default {
    name: 'App',
    created() {
      this.$store.dispatch('connectWebSocket');
    }
  };
  </script>
  
  <style lang="scss" scoped>
  html, body, #app {
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
  }
  
  .app-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
  }
  
  .router-view-content {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  
  .navigation {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 16px;
    background-color: #333;
    color: #fff;
  }
  </style>
  