<template>



</template>



<script>
import { ref } from 'vue'
import {mapState, mapActions} from 'vuex';
import MainLayout from '/src/layout/MainLayout.vue'


export default {
    name: 'Neutral',
    components: {
      MainLayout
    }, 
    data: () =>({

    }),
    computed: {
        sessionID: state => state.sessionID
        
    }
}




</script>