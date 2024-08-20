<template>
    <div id="app">
      <router-view></router-view>
    </div>

    <nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/vizualiser">Go to vizualiser</RouterLink>
  </nav>

  <v-snackbar
      v-model="showSnackbar"
      :timeout="5000"
      :color = "this.toastType"
    >
      {{ snackbarMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="blue"
          text
          v-bind="attrs"
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>


</template>
  
  <script>
  import { mapState } from 'vuex';

  export default {
    name: 'App',
    data() {
      return {
        showSnackbar: false,
        snackbarMessage: '',
      };
    },
    computed: {
      ...mapState(['toastMessage', 'toastType'])
    },
    watch: {
      toastMessage(newMessage) {
        this.showToast(newMessage)
        console.log(this.toastType)
      },
    },
    methods: {
      showToast(message) {
        this.snackbarMessage = message.length > 50 ? message.substring(0, 47) + '...' : message; // Truncate long messages
        this.showSnackbar = true;
      },
    },
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
  flex-direction: column; /* Change to column if the layout should be vertical */
  height: 100%;
  width: 100%;
  justify-content: center; /* Center horizontally if needed */
  align-items: center; /* Center vertically if needed */
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

  .v-snackbar {
  max-width: 80%; /* Limit width */
  white-space: normal; /* Wrap text */
  font-size: 14px; /* Adjust font size */
}
  </style>
  