<template>
<MainLayout
    column
    leftButton="Back"
    rightButton="Record Neutral pose"
    :step="3"
    :rightDisabled="this.processed==false" 
    @left="this.$router.push(`/${this.sessionID}/calibration`)"
    @right="onNext">

</MainLayout>


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

    },
    methods: {
        onNext(){
            console.log('onNext pressed')
            
        }
    }
}




</script>