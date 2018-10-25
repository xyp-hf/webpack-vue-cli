<template>
    <div @click="showRunxIM" id="runx_im_entry_button">

    </div>
</template>

<script lang="js" src="./entryButton.js">
</script>

<style lang="scss" scoped>
#runx_im_entry_button {
    position: fixed;
    right: 30px;
    bottom: 300px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: url(../../assets/images/entry_btn.png) no-repeat;
    background-size: 60px 60px;
    background-position: center;
}
#runx_im_entry_button:hover {
    cursor: pointer;
}
</style>

