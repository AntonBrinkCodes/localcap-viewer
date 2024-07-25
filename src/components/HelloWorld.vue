<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import QRCodeVue3 from "qrcode-vue3";

export default {
  name: 'Home',
  components: {
    QRCodeVue3
  },
  data() {
    return {
      count:0,
      msg: "",
    }
  },
 
}

const router = useRouter();

</script>

<template>
  <h1>{{ msg }}</h1>
<p>
  <QRCodeVue3
          value="Simple QR code"
       ></QRCodeVue3>
</p>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
    <p>
      <strong>Current route path:</strong> {{ $route.fullPath }}
    <!--<button @click="goToAnotherPage">Go to Vizualiser Page</button>-->
    </p>

  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>


<style scoped>
.read-the-docs {
  color: #888;
}
</style>
