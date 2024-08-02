// src/store.js
import { createStore } from 'vuex';

//192.168.0.48
const baseURL = "192.168.0.48:" //"130.229.132.75:" // Replace with where fastAPI backend is hosted. Perhaps should not be state
const port = "8080"

export default createStore({
  state: {
    webSocket: null,
    connectionStatus: 'Disconnected',
    clientsCount: 0,
    mobilesCount: 0,
    receivedMessage: '',
    BASEURL: '',
    sessionID: '',
  },
  mutations: {
    SET_WEBSOCKET(state, webSocket) {
      state.webSocket = webSocket;
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
    SET_RECEIVED_MESSAGE(state, message) {
      state.receivedMessage = message;
    },
    SET_BASEURL(state){
      state.BASEURL = baseURL + port;
    },
    async SET_SESSIONID(state, message){
      state.sessionID = message;
      console.log(`session ID in state is: ${state.sessionID}`)
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

        if (message.startsWith("Web-apps connected:")) { //When a new client (web or mobile) connects.
          commit('SET_CLIENTS_COUNT', parseInt(message.split(": ")[1]));
          commit('SET_MOBILES_COUNT', parseInt(message.split(": ")[2]))         
        } else if (message.startsWith("New session id:")){
          commit('SET_SESSIONID', message.split(": ")[1])

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

    sendMessage({ state }, message) {
      if (state.webSocket && state.connectionStatus === 'Connected') {
        console.log(message)
        state.webSocket.send(message);
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

      

    }
  },
  modules: {}
});
