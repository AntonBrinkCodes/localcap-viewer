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
  
  <style>
  /* Your styles here */
  </style>
  