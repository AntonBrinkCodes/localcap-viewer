// src/store.js
import { createStore } from 'vuex';
import data from '@/store/data'

// Replace baseURL with where fastAPI backend is hosted. Perhaps should not be state but in env thing
//192.168.0.48 home
const baseURL = "130.229.141.43:" // LINUX
//const baseURL = "192.168.50.9:" // Landet: Remove :)
//const baseURL = "192.168.0.48:" //(MAC IN EDUROAM?) 
const port = "8080"

export default createStore({
  state: {
    webSocket: null,
    sessionWebSocket: null, // maybe not needed..
    connectionStatus: 'Disconnected',
    clientsCount: 0,
    mobilesCount: 0,
    sessionCameras: 0,
    receivedMessage: '',
    receivedSessionMessage: '',
    BASEURL: '',
    sessionID: '',
    toastMessage: '',
    toastType: 'info',
    sessionList: {},
    trialList: {},
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
      console.log("changing toastMessage")
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
        console.log('Received:', message);

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
          if (jsonMessage.command=="subjects") {
            commit('data/SET_SUBJECTS', jsonMessage.content)
          } else if (jsonMessage.command = "sessions"){
            commit('SET_SESSION_LIST', jsonMessage.content)
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
    connectSessionWebSocket({ state, commit, dispatch }) {
      return new Promise((resolve, reject) => {
        console.log('Connecting to session WS: ', state.sessionID);
    
        const sessionWS = new WebSocket(`ws://${state.BASEURL}/ws/${state.sessionID}/session?client_type=web`);
    
        // WebSocket onopen handler
        sessionWS.onopen = () => {
          console.log("Session WebSocket connected successfully");
          commit('SET_SESSION_WEBSOCKET', sessionWS); // Commit the WebSocket instance to the state
          resolve(); // Resolve the Promise
        };
    
        // WebSocket onerror handler
        sessionWS.onerror = (error) => {
          console.error("Session WebSocket encountered an error: ", error);
          reject(error); // Reject the Promise
        };
    
        // WebSocket onclose handler
        sessionWS.onclose = () => {
          console.log(`Session WebSocket closed for session ID: ${state.sessionID}`);
          commit('SET_SESSION_WEBSOCKET', null); // Clear the WebSocket instance from the state
        };
    
        // WebSocket onmessage handler
        sessionWS.onmessage = (event) => {
          const message = event.data;
          console.log(`Message received in session WebSocket: ${message}`);
          console.log(state.sessionID);
    
          if (message.startsWith(`Session ${state.sessionID} `)) {
            console.log(`Message received from server: ${message}`);
            // Handle session-specific messages
            if (message.startsWith(`Session ${state.sessionID} mobiles connected:`)) {
              commit('SET_SESSION_CAMERAS', parseInt(message.split(": ")[1]));
            }
          } else if (message.startsWith("Toast")) {
            console.log("Message starts with Toast");
            // Handle toast messages
            dispatch('triggerToast', message);
          } else {
            // Assume it's JSON if no specific string match
            try {
              const jsonMessage = JSON.parse(message);
    
              if (jsonMessage.command == "calibration") {
                const success = jsonMessage.content.match("success");
                commit('data/SET_CALIBRATED', success);
              } else if (jsonMessage.command == "pong") {
                console.log("Received PONG from session WebSocket");
              } else if (jsonMessage.command == "visualizerJSON") {
                console.log("Received new visualizer JSON");
                const visualizerJson = jsonMessage.content;
                commit('data/SET_VISUALIZER_JSON', visualizerJson);
              } else if (jsonMessage.command == "sessionTrials") {
                console.log("Received session trials");
                commit('data/SET_SESSION_TRIALS', jsonMessage.content);
              }
            } catch (err) {
              console.error("Error parsing JSON message: ", err);
            }
          }
    
          commit('SET_RECEIVED_SESSION_MESSAGE', message);
        };
      });
    },
    
    async sendMessage({ state, dispatch }, { message, session_id = null }) {
      console.log("Sending message:", message);
      const data = message;
    
      if (session_id === state.sessionID) {
        // Ensure the session WebSocket is connected
        if (!state.sessionWebSocket || state.sessionWebSocket.readyState !== WebSocket.OPEN) {
          console.log("Session WebSocket not connected, connecting now...");
          try {
            await dispatch('connectSessionWebSocket'); // Wait for connection
          } catch (error) {
            console.error("Failed to connect to session WebSocket:", error);
            return; // Exit if connection fails
          }
        }
    
        // Send to the session WebSocket
        if (state.sessionWebSocket) {
          console.log("Sending to session WebSocket");
          state.sessionWebSocket.send(data);
        }
      } else {
        // Send to general WebSocket
        if (state.webSocket && state.connectionStatus === 'Connected') {
          console.log("Sending to general WebSocket");
          state.webSocket.send(data);
        }
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
    disconnectSessionWebSocket({ state, commit }){
      if(state.sessionWebSocket){
        console.log("Closing session websocket.")
        state.sessionWebSocket.close()
      }
        commit('SET_SESSIONID', null)
      
    },
    triggerToast({ state, commit} , message){
      const msgType = message.split(": ")[1]
      
      const msgPart = message.split(": ").slice(2).join(": ")
      commit('SET_TOASTTYPE', msgType)
      commit('SET_TOASTMESSAGE', msgPart)
    },

  },
  modules: {
    data
  }
});
