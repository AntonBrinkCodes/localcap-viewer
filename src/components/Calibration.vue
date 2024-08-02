<template>

<v-card class="step-2-2 mt-4 flex-grow-1">
      <v-card-title class="justify-center">
        Place a checkerboard in the scene
      </v-card-title>

      <v-card-text class="d-flex align-center">
        <ul class="flex-grow-1">
          <li>It should be visible by all cameras (nothing in the way of cameras' view when hitting Calibrate)</li>
          <li>It should be horizontal (longer side on the floor)</li>
          <li>It should be perpendicular to the floor (not lying on the floor)</li>         
        </ul>

        <div class="image-container pa-3">
          <img src="/images/checkerboard-placement.png"/>
        </div>
      </v-card-text>
    </v-card>
</template>

<script>

export default {
    name: 'Calibration',
    components: {

    },
    data () {
        return {

        }
    },
    computed: {

    },
    mounted (){

    },
    methods: {

    },
    

}

</script>