// src/store.js
import { createStore } from 'vuex';

//192.168.0.48 home
const baseURL = "130.229.141.43:" //(MAC IN EDUROAM?) // "130.229.141.43:" (LINUX) // Replace with where fastAPI backend is hosted. Perhaps should not be state but in env thing
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
    SET_TOASTMESSAGE(state, message){
      console.log("changing toastMessage")
      state.toastMessage = message
    },
    SET_TOASTTYPE(state, type) {
      state.toastType = type.toLowerCase()
      console.log(state.toastType)
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
    connectSessionWebSocket({ state, commit, dispatch }){
      const sessionWS = new WebSocket(`ws://${state.BASEURL}/ws/${state.sessionID}/session?client_type=web`);

      sessionWS.onopen = () =>{
        console.log("ran session WS onopen()")
      };

      sessionWS.onClose = () => {
        console.log(`Closing session with id: ${state.SESSIONID}`)
        
        //commit('SET_SESSIONID', null)
      };
      // TODO: rewrite this to work on JSON :)
      sessionWS.onmessage = (event) => {
        const message = event.data
        console.log(`Message received in sessionWS: ${message}`)
        console.log(state.sessionID)
        if (message.startsWith(`Session ${state.sessionID} `)){
          console.log(`message received from server: ${message}`)
        // Do stuff related to session
        // Like maybe change if a trial is processing etc.
          if (message.startsWith(`Session ${state.sessionID} mobiles connected:`)){
            commit('SET_SESSION_CAMERAS', parseInt(message.split(": ")[1]))
          } 
        } else if (message.startsWith("Toast")){
          console.log("message starts with Toast")
          // Send from server via session specific websocket with some info regarding the session.
          dispatch('triggerToast', message)
        }
        ;
      
        
        commit('SET_RECEIVED_SESSION_MESSAGE', message)
      };
      commit('SET_SESSION_WEBSOCKET', sessionWS)

    },
    sendMessage({ state }, {message, session_id = null}) {
        console.log(message)
        const data = message
        const id = session_id
        // Send to session
        if(id==state.sessionID){
          console.log(state.sessionWebSocket)
          if (state.sessionWebSocket && state.connectionStatus ==='Connected'){
            // TODO: Add logic to reconnect to this sessionID if it's not active-
            console.log("sending to session")
            state.sessionWebSocket.send(data)
          }
        // Send to general server.
        } else {
          if (state.webSocket && state.connectionStatus === 'Connected') {
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
  modules: {}
});
