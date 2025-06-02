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

  

    <div class="overflow-auto">
      <!-- Row with session list and new session button -->
      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="session-list-title">Session List</h2>
        <!-- Tooltip wrapping the New Session button -->
        <!-- Tooltip for the New Session button -->
        <v-tooltip location="bottom" >
  <template #activator="{ props }">
    <v-btn
      v-bind="props"
      @click="startSession"
      :disabled="connectionStatus !== 'Connected'"
    >
      New Session
    </v-btn>
  </template>
  WebSocket Status: {{ this.connectionStatus }}
</v-tooltip>
      </div>
      <v-text-field
  v-model="maxFrameRate"
  type="number"
  label="DEBUG Max Frame Rate min 60 max 500"
  :min="60"
  :max="500"
  :step="15"
  class="mb-4"
/>
      <!-- Search Field -->
      <v-text-field
        v-model="search"
        label="Search"
        placeholder="Search by Subject Name or Session ID"
        class="mb-4"
      />

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredSessions"
        :items-per-page="5"
        class="elevation-1 fixed-height-table"
        single-select
        @click:row="onRowClick"
      >
        <template v-slot:[`item.action`]="{ item }">
          <v-btn icon="mdi-delete" @click.stop="showDeleteDialog(item.sessionID)">
          </v-btn>
        </template>
      </v-data-table>


    </div>

  

    <!-- Confirmation Dialog for Deleting -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">
          Are you sure you want to delete this session?
        </v-card-title>
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
      maxFrameRateFromStore: state => state.maxFrameRate
    }),
    maxFrameRate: {
    get() {
      return this.maxFrameRateFromStore
    },
    set(value) {
      this.$store.commit('SET_MAX_FRAME_RATE', value)
    }
  },
    headers() {
      return [
        { title: 'Session ID', key: 'sessionID', align:'start', sortable:false },
        { title: 'Session Name', key: 'sessionName', align: 'end', sortable: false},
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
        sessionName: session.sessionName || "-",
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
/* Aligns the Session List heading and New Session button in a single row */
.d-flex-hello {
  display: flex;
}

.align-center-hello {
  align-items: center;
}

.justify-space-between-hello {
  justify-content: space-between;
}

.mb-4-hello {
  margin-bottom: 1rem;
}

.session-list-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

/* Ensures consistent height for the data table */
.fixed-height-table {
  min-height: calc(5 * 48px + 56px); /* 5 rows of 48px each + table header height */
  /*max-height: calc(5 * 48px + 56px); /* Same calculation for max height */
  overflow: hidden; /* Prevent scrolling within the table */
}
</style>

