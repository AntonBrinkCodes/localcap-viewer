// src/store.js
import { createStore } from 'vuex';
import data from '@/store/data'

// Replace baseURL with where fastAPI backend is hosted. Perhaps should not be state but in env thing
//const baseURL = "192.168.0.2:" //home
const baseURL = "130.229.135.163:" // LINUX
//const baseURL = "192.168.50.9:" // Landet: Remove :)
//const baseURL = "192.168.0.48:" //(MAC IN EDUROAM?) 
const port = "8080"
const MAXFRAMERATE = 500
export default createStore({
  state: {
    webSocket: null,
    connectionStatus: 'Disconnected',
    clientsCount: 0,
    mobilesCount: 0,
    sessionCameras: 0,
    uploadedVideos: 0,
    receivedMessage: '',
    receivedSessionMessage: '',
    BASEURL: '',
    sessionID: '',
    toastMessage: '',
    toastType: 'info',
    sessionList: {},
    trialList: {},
    // For Downloading
    isDownloading: false,  // Indicate whether a download is in progress
    downloadFilename: "",
    maxFrameRate: MAXFRAMERATE // Current max that we allow probably none that has this :)

    
  },
  mutations: {
    SET_WEBSOCKET(state, webSocket) {
      state.webSocket = webSocket;
    },
    SET_SESSION_WEBSOCKET(state, webSocket){
      console.log("connecting to session WS")
      state.sessionWebSocket = webSocket;
    },
    SET_CONNECTION_STATUS(state, status) {
      state.connectionStatus = status;
    },
    SET_CLIENTS_COUNT(state, count) {
      state.clientsCount = count;
    },
    SET_MOBILES_COUNT(state, count) {
      state.mobilesCount = count;
    },
    SET_SESSION_CAMERAS(state, count){
      console.log(`Setting sessionCameras to ${count}`)
      state.sessionCameras = count;
    },
    SET_RECEIVED_MESSAGE(state, message) {
      state.receivedMessage = message;
    },
    SET_RECEIVED_SESSION_MESSAGE(state, message){
      state.receivedSessionMessage = message;
    },
    SET_BASEURL(state){
      state.BASEURL = baseURL + port;
    },
    async SET_SESSIONID(state, message){
      state.sessionID = message;
      console.log(`session ID in state is: ${state.sessionID}`)
    },
    SET_SESSION_ID_SYNCED(state, message){
      state.sessionID=message
    },
    SET_TOASTMESSAGE(state, message){
      console.log(`changing toastMessage to ${message}`)
      state.toastMessage = message
    },
    SET_TOASTTYPE(state, type) {
      state.toastType = type.toLowerCase()
      console.log(state.toastType)
    },
    SET_SESSION_LIST(state, values){
      console.log("Received new session list", values)
      state.sessionList = values
    },
    SET_TRIAL_LIST(state, values){
      console.log("Received new trials list", values)
      state.trialList = values
    },
    /* Mobile connection stuff*/
    SESSION_CAMERA_CONNECTED(state){
      state.sessionCameras++;
    },
    RESET_SESSION_CAMERA(state) {
      state.sessionCameras = 0
    },
    UPLOADED_VIDEO(state) {
      state.uploadedVideos++;
    },
    RESET_UPLOADED_VIDEOS(state) {
      console.log("setting uploaded videos to 0")
      state.uploadedVideos = 0
    },
    NEW_CAMERA_MAX_FRAME_RATE(state, framerate) {
      console.log(`framerate recieved: ${framerate}, old max is: ${state.maxFrameRate}`)
      if (framerate < state.maxFrameRate) {
        console.log("Replacing old framerate")
        state.maxFrameRate = framerate
      }
    },
    RESET_CAMERA_MAX_FRAME_RATE(state){
      state.maxFrameRate = MAXFRAMERATE
    },
    SET_MAX_FRAME_RATE(state, framerate){
      console.log(`setting framerate to ${framerate}`)
      state.maxFrameRate =  framerate
    },
    
    /* DOWNLOAD STUFF */
    START_DOWNLOAD(state, filename) {
      state.isDownloading = true;
      state.downloadFilename = filename;
    },
  
    RESET_DOWNLOAD(state) {
      state.downloadFilename = "";
      state.isDownloading = false;
    },

  },
  actions: {
    connectWebSocket({ state, commit, dispatch }) {
      commit('SET_BASEURL');
      const ws = new WebSocket("ws://"+
        state.BASEURL+
        "/ws?client_type=web"); 

      ws.onopen = () => {
        console.log("Ran ws.onopen()")
        commit('SET_CONNECTION_STATUS', 'Connected');
      };

      ws.onmessage = (event) => {
        const message = event.data;
        //console.log('Received:', message);

        if (message.startsWith("General Web-apps connected:")) { //When a new client (web or mobile) connects without session_id (should only be web clients).
          commit('SET_CLIENTS_COUNT', parseInt(message.split(": ")[1]));
          commit('SET_MOBILES_COUNT', parseInt(message.split(": ")[2]))         
        } else if (message.startsWith("New session id:")){
          commit('SET_SESSIONID', message.split(": ")[1].trimEnd())

        }
         else {
          commit('SET_RECEIVED_MESSAGE', message);
          // handle message as json:
          const jsonMessage = JSON.parse(message)
          console.log(`received command: ${jsonMessage.command}`)
          if (jsonMessage.command=="new_session"){
            commit('SET_SESSIONID', jsonMessage.content)
          }
          else if (jsonMessage.command=="subjects") {
            commit('data/SET_SUBJECTS', jsonMessage.content)
          } else if (jsonMessage.command == "sessions"){
            console.log("received message with command 'sessions' ")
            commit('SET_SESSION_LIST', jsonMessage.content)
          }
          else if (jsonMessage.command == "mobile_connected"){
            console.log("MOBILE CONNECTED")
            console.log(jsonMessage.content)
            commit('SESSION_CAMERA_CONNECTED')
            commit('NEW_CAMERA_MAX_FRAME_RATE', jsonMessage.maxFrameRate)
          }
          else if (jsonMessage.command == "video_uploaded") {
            console.log("Video Uploaded")
            commit('UPLOADED_VIDEO')

          }
          else if (jsonMessage.command == "new_dynamic_trialId") {
            commit('data/SET_NEW_TRIAL_ID', jsonMessage.content) // WHen recording a new dynamic trial, get the new trial ID.
          }

          else if (jsonMessage.command=="process_succeded"){ //Messages regarding calibration
            const type = jsonMessage.trialType
            console.log(`succesfully processed trial of type: ${type}`)
            if (type == "calibration") {
              commit('data/SET_CALIBRATED', true )
            } else if (type == "neutral") {
              console.log("commiting to neutralPose:")
              commit('data/SET_NEUTRALPOSE', true)
            } // add dynamic here too?
            
          }
          else if (jsonMessage.command=="pong"){
            console.log("Got PONG back from session websocket")
          }
          else if (jsonMessage.command == "visualizerJSON"){
            console.log("Got new visualizer JSON")
            const visualizerJson = jsonMessage.content
            commit('data/SET_VISUALIZER_JSON', visualizerJson)
          }
          else if (jsonMessage.command == "sessionTrials"){
            console.log("Going to commit to data/SET_SESSION_TRIALS")
            commit('data/SET_SESSION_TRIALS', jsonMessage.content)
          }
          else if (jsonMessage.command == "maxVidCount") {
            console.log("Commiting to data/SET_SESSION_MAXVIDCOUNT")
            commit('data/SET_SESSION_MAXVIDCOUNT', jsonMessage.content)

          }
          else if (jsonMessage.command =="Toast") {
              const toastType = jsonMessage.type
              const message = jsonMessage.content
              dispatch('triggerToast', {toastType: toastType, message: message})
          }
          else if (jsonMessage.command === "download_start") {
            // Example: Start download with filename
            dispatch("startDownload", jsonMessage.filename || "session.zip");
          }
          else if (jsonMessage.command == "download_link") {
            const downloadUrl = jsonMessage.link;
            dispatch('downloadLink', downloadUrl)   
        } else if (jsonMessage.command === "visualizer_videos") {
          // Map the received videos to include a decoded video URL
          const videos = jsonMessage.content.map((video) => {
            const byteString = atob(video.data);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
          
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
          
            const blob = new Blob([ab], { type: 'video/mp4' });
            const blobUrl = URL.createObjectURL(blob);
          
            return {
              ...video,
              src: blobUrl, // Use Blob URL instead of a Data URL
            };
          });
          
          commit('data/SET_VISUALIZER_VIDEOS', videos);
          //const videos = jsonMessage.content.map((video) => ({
          //  ...video,
          //  src: `data:video/mp4;base64,${video.data}` // Create a data URL for the video
          //}));
          //commit('data/SET_VISUALIZER_VIDEOS', videos)
        }
    }
        
      };

      ws.onclose = () => {
        commit('SET_CONNECTION_STATUS', 'Disconnected');
        commit('SET_CLIENTS_COUNT', 0)
        // Reconnect automatically
        setTimeout(() => {
            console.log("Trying to reconnect")
          dispatch('connectWebSocket');
        }, 5000);
      };

      commit('SET_WEBSOCKET', ws);
    },
    
    
    sendMessage({ state }, message) {
        console.log(message)
        const data = message

          if (state.webSocket && state.connectionStatus === 'Connected') {
          console.log("sending to general ws")
          state.webSocket.send(data);
          }
          else {
            console.error("Tried to send message but not connected to websocket")
          }
      },
    getBASEURL({state}) {
      return state.BASEURL
    },
    getSessionID({state}){
      return state.sessionID
    },
    async createSessionOnServer({ state }, message){
      if (state.webSocket && state.connectionStatus === 'Connected') {
        await state.webSocket.send(message)
      }      
    },
    resetSession({ state, commit }){
      console.log("RESETING SESSION")
        commit('RESET_UPLOADED_VIDEOS')
        commit('RESET_SESSION_CAMERA')
        commit('SET_SESSIONID', null)
        commit('data/SET_CALIBRATED', false)
        commit('data/SET_NEUTRALPOSE', false)
        commit('data/SET_NEW_TRIAL_ID', "")
        commit('data/SET_TEST_SESSION', false) 
        commit('RESET_CAMERA_MAX_FRAME_RATE')     
    },
    triggerToast({ state, commit} , {toastType, message}){
      console.log("In trigger Toast")
      commit('SET_TOASTTYPE', toastType)
      commit('SET_TOASTMESSAGE', message)
    },
    startDownload({ commit }, filename) {
      commit("START_DOWNLOAD", filename);
    },
    addFileChunk({ commit }, chunk) {
      commit("ADD_FILE_CHUNK", chunk);
    },
    downloadLink({state, commit}, downloadUrl){

      console.log(downloadUrl)
      // Optionally, you can trigger an automatic download:
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "";  // Optionally set a custom filename
      a.click();
      commit('RESET_DOWNLOAD')
    },
    

  },
  modules: {
    data
  }
});
