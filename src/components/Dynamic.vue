<template>

    <v-card class="mb-4">
        <v-card-title class="justify-center subject-title">
          Dynamic trials (WIP)
        </v-card-title>
        <v-card-text>

            <v-btn @click="startDynamic">
                Run dynamic Trial
             <v-tooltip
                activator="parent"
                location="bottom"
            >Run test dynamic trial on backend.</v-tooltip>
            </v-btn>
        </v-card-text>

        <v-btn @click="this.$router.push(`/`)" >
            Back to home
        </v-btn>
    </v-card>

</template>

<script>
import {mapState, mapActions} from 'vuex'

export default{
    name: 'Dynamic',
    components: {
        
    },
    data () {
        return {
            trialName: ""
        }
    },
    computed: {
        ...mapState({
            sessionID: state => state.sessionID,
            cameras: state => state.mobilesCount,
        }),
        ...mapState('data',{
            isTest: state => state.test_session,
        }),
    },
    methods: {
        ...mapActions(['sendMessage', 'getBASEURL']),
        startDynamic() {
            const startDynamicMsg = {
                command: "start_dynamic",
                trialName: this.trialName,
                isTest: this.isTest
            }
            console.log('message is: ', startDynamicMsg)
            this.sendMessage({
                message: JSON.stringify(startDynamicMsg),
                session_id: this.sessionID
            })
        },
    },

    
}

</script>