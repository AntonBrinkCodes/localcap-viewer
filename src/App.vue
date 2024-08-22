<template>
  <v-app :style="{background: $vuetify.theme.themes.dark.background}">
  <v-main>
    <router-view></router-view>
  </v-main>
    <!--<nav class="navigation">
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/vizualiser">Go to vizualiser</RouterLink>
    </nav>-->

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
  </v-app>
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
  .logo {
    user-select: none;
    margin-top: 10px;
  }

  </style>