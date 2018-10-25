<template>
  <div id="runx_im">
    <!-- <speech-demo></speech-demo> -->
    <entry-button v-show="!isShowRunxIM"></entry-button>
    <runx-i-m v-show="isShowRunxIM"></runx-i-m>
  </div>
</template>

<script>
// import speechDemo from "./components/speechDemo";
import runxIM from "./components/runxIM";
import entryButton from "./components/entryButton";

export default {
  name: "runx_im",
  components: {
    entryButton,
    runxIM,
    // speechDemo,
  },
  computed: {
    isShowRunxIM() {
      return this.$store.state.runxIM.isShowRunxIM;
    },
  }
};
</script>

<style>
</style>
