<template>
    <div class="d-flex justify-space-around">
      <v-btn
        icon
        :disabled="frame === 0 || disabled || playing"
        @click="frame = 0">
        <v-icon>mdi-skip-backward</v-icon>
      </v-btn>
  
      <v-btn
        icon
        :disabled="frame === 0 || disabled || playing"
        @click="frame--">
        <v-icon>mdi-step-backward</v-icon>
      </v-btn>      
  
      <v-btn
        icon
        :disabled="disabled"
        @click="$emit(playing ? 'pause' : 'play')">
        <v-icon>{{ playing ? 'mdi-pause' : 'mdi-play' }}</v-icon>
      </v-btn>
  
      <v-btn
        icon
        :disabled="frame === maxFrame || disabled || playing"
        @click="frame++">
        <v-icon>mdi-step-forward</v-icon>
      </v-btn>      
  
      <v-btn
        icon
        :disabled="frame === maxFrame || disabled || playing"
        @click="frame = maxFrame">
        <v-icon>mdi-skip-forward</v-icon>
      </v-btn>      
    </div>
  </template>
  
  <script>
  export default {
    name: 'VideoNavigation',
    props: {
      // Current frame
      value: Number,
      maxFrame: Number,
      disabled: {
        type: Boolean,
        default: false
      },
      playing: Boolean
    },
    computed: {
      frame: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      }
    }
  }
  </script>