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
  import QRCodeVue3 from "qrcode-vue3";
  export default {
    name: 'App',
    components: {
  },
  }
  </script>
  
  <style>
  /* Your styles here */
  </style>
  