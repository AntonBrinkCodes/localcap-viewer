<template>
  <MainLayout
    column
    leftButton="Back"
    rightButton="Calibrate"
    :step="2"
    :rightDisabled="!this.connectionStatus"
    :leftDisabled="true"
    @left="this.$router.push(`/`)"
    @right="startSession">

  <div>
    <v-card class="fill-width d-flex flex-column justify-space-between">
      <v-card-text class="d-flex flex-column align-center flex-grow-1">
        <v-row class="d-flex align-center flex-wrap fill-height w-100">
          <v-col cols="12" md="6" class="d-flex flex-column justify-space-between my-1">
            <div>
              <h1 class="my-1"> Websocket Client  </h1>
              <h1 class="my-1"> {{ connectionStatus }}</h1>
              <h1 class="my-1">Web-apps connected: {{ clientsCount }}</h1>
              <h1 class="my-1">Mobiles connected: {{ mobilesCount }}</h1>
            </div>
    
          </v-col>
          <!-- Start new Session button-->
      <v-btn @click="startSession">
        New Session
      </v-btn>
      <v-btn @click="this.$router.push('/visualizer')"> Visualizer</v-btn> <!-- Test-->
        </v-row>
      </v-card-text>
    </v-card>
  </div>

  <div>
    <h1>Session List</h1>
    <v-text-field
      v-model="search"
      label="Search"
      placeholder="Search by Subject Name or Session ID"
      class="mb-2"
    />
    <v-data-table
      :headers="headers"
      :items="filteredSessions"
      :items-per-page="5"
      class="elevation-1"
      single-select
      @click:row="onRowClick"
    >
      <!-- Add other slots if needed for custom item rendering -->
       <!-- Slot for remove item.-->
      <template v-slot:[`item.action`]="{ item }">
    <!-- Add the button here -->
    <v-btn icon="mdi-delete" @click.stop="showDeleteDialog(item.sessionID)"> <!-- click.stop supposedly stops the row onclick from also triggering-->
    </v-btn>
  </template>
    </v-data-table>
  </div>

  <!-- Confirmation Dialog for Deleting -->
  <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Are you sure you want to delete this session?</v-card-title>
        <v-card-actions>
          <v-btn color="green darken-1" text @click="cancelDelete">
            Cancel
          </v-btn>
          <v-btn color="red darken-1" text @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</MainLayout>

</template>

<script>
import { ref } from 'vue'
import QRCodeVue3 from "qrcode-vue3";
import {mapState, mapActions} from 'vuex';
import MainLayout from '../layout/MainLayout.vue';

export default {
  name: 'Home',
  components: {
    MainLayout
  },
  data() {
    return {
      search: '',
      deleteDialog: false,
      sessionToDelete: "",
    }
  },
  computed: {
    ...mapState({
      connectionStatus: 'connectionStatus',
      clientsCount: 'clientsCount',
      mobilesCount: 'mobilesCount',
      recievedMessage: 'receivedMessage',
      BASEURL: state =>  state.BASEURL,
      sessionID: state => state.sessionID,
      sessionList: state => state.sessionList,
    }),
    headers() {
      return [
        { title: 'Session ID', key: 'sessionID', align:'start', sortable:false },
        { title: 'Subject Name', key: 'subjectName', align:'end', sortable:false },
        { title: 'Height (m)', key: 'height', align:'end'},
        { title: 'Mass (kg)', key: 'mass' , align:'end'},
        { title: 'Session Date', key: 'sessionDate', align:'end' },
        { title: 'Delete', key: 'action', align: 'center' }, // Delete Button
      ];
    },
    filteredSessions() {
      // Convert sessionList object to an array and filter based on the search term
      const sessionsArray = Object.entries(this.sessionList).map(([uuid, session]) => ({
        uuid, // Keep UUID for unique identification
        sessionID: session.sessionID || uuid,
        subjectName: session.subjectName || '-',
        height: session.height || '-',
        mass: session.mass || '-',
        sessionDate: session.sessionDate || '-',
      }));

      // Apply search filter if search query is not empty
      const filteredArray = this.search
        ? sessionsArray.filter(
            session =>
              session.subjectName.toLowerCase().includes(this.search.toLowerCase()) ||
              session.sessionID.toLowerCase().includes(this.search.toLowerCase())
          )
        : sessionsArray;

      // Sort the array by sessionDate in descending order
      return filteredArray.sort((a, b) => {
        // Convert date strings to Date objects for comparison
        const dateA = new Date(a.sessionDate);
        const dateB = new Date(b.sessionDate);

        // If either date is invalid (e.g., empty), place it at the end
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;

        // Sort by date descending (latest dates first)
        return dateB - dateA;
      });

    },
  },  
  watch: {
    sessionList(newSessionList){
      this.sessionList = newSessionList;
      console.log(this.sessionList)
    },
    connectionStatus(newStatus){
      if(newStatus){
        this.askForSession()
      }
      

    }
  },
  methods: {
    ...mapActions(['sendMessage', 'getBASEURL', 'connectSessionWebSocket']),
    // Reusable function for checking the session ID
    checkSessionCondition({ storeAction = null, routePath = null, intervalTime = 100, condition = () => this.sessionID }) {
      const interval = setInterval(() => {
        console.log("Checking condition for session...");

        // Check if the condition is met (default condition is this.sessionID is set)
        if (condition()) {
          console.log("Condition met, sessionID is: ", this.sessionID)
          console.log(routePath)
          clearInterval(interval); // Stop checking

          // Dispatch the store action if provided
          if (storeAction) {
            this.$store.dispatch(storeAction);
          }

          // Navigate to the given route if provided
          if (routePath) {
            const path = `/${this.sessionID}`+routePath
            console.log(path)
            this.$router.push(path);
          }
        }
      }, intervalTime);
    },
    askForSession(){
      console.log("asking For Sessions?")
      const askForSessionmsg = {
        command:"get_sessions"
      }
      console.log(askForSessionmsg)
      this.sendMessage(JSON.stringify(askForSessionmsg));

    },
    onRowClick(item, params){
      console.log("clicked on row: ", params.item.uuid)
      // Disconnect from old session if it exists:
      this.disconnectSession()
      // Set the sessionID to that of the clicked row,
      this.$store.commit('SET_SESSION_ID_SYNCED', params.item.uuid)
      //alert(this.sessionID)
      //Connect to that session websocket.
      this.checkSessionCondition({
        storeAction: 'connectSessionWebSocket', // Action to dispatch when sessionID is set
        routePath: `/dynamic`, // Navigate to the session path when ready
        intervalTime: 100, // Check every 100 milliseconds
        condition: () => this.sessionID, // Custom condition: wait until sessionID is set
    }); 
    },
    showDeleteDialog(item){
      console.log("Button clicked for session:", item);
      this.sessionToDelete = item;
      this.deleteDialog = true
    },
    cancelDelete(){
      // Close the dialog
      this.sessionToDelete = ""
      this.deleteDialog = false
    },
    confirmDelete(){
      this.deleteSession(this.sessionToDelete)
      this.deleteDialog = false
      this.askForSession()
    },
    deleteSession(sessionID){
      const deletemsg = {
      command: "delete_session",
      content: this.sessionToDelete,
      session: sessionID
    }
    console.log(deletemsg)
      this.sendMessage(
      JSON.stringify(deletemsg),
      )
    },
    startRecording(){
      this.$store.dispatch('sendMessage', 'start')
    },
    stopRecording(){
      this.$store.dispatch('sendMessage', 'stop')
    },
    disconnectSession(){
      console.log('disconnecting from ', this.sessionID)
      if(this.sessionID || this.$store.state.sessionWebSocket){
        console.log("Removing old session")
        // remove session ID and disconnect session websockets
        this.$store.dispatch('resetSession')
        
      }
    },
    async startSession(){
      this.disconnectSession() // disconnects from any previous session by resetting all states connected to sessions.

      // Create a session on the websocket and get the UUID for it.
      // This should also Commit UUID to state.
      const newSessionMsg = {
        command: "newSession"
      }
      await this.$store.dispatch('createSessionOnServer', JSON.stringify(newSessionMsg))

      // Check sessionID every 0.1 seconds. Waiting for response from server basically.
      this.checkSessionCondition({
        storeAction: 'connectSessionWebSocket', // Action to dispatch when sessionID is set
        routePath: `/session`, // Navigate to the session path when ready
        intervalTime: 100, // Check every 100 milliseconds
        condition: () => this.sessionID, // Custom condition: wait until sessionID is set
    });
      
    },
    
  },
  created() {
    // Get the sessions
    console.log("Hello world created")
  },
  mounted() {
    //this.disconnectSession()
    console.log("hello world mounted")
    if(this.connectionStatus){
      this.askForSession()
    }
  }

};
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
