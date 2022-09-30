<script setup>
import TimestamperForm from './components/TimestamperForm.vue'
</script>

<template>
  <div class="container mx-auto my-10 px-4">
    <div class="text-center mb-12">
      <h1 class="text-4xl mb-5">
        <a href="./">Lichess YouTube Timestamper</a>
      </h1>
      <p class="text-xl">Automatically add chapters of your chess games to your YouTube videos</p>

      <h3 class="text-2xl mt-6">Go from this:</h3>
      <img src="/no-chapters.png" class="w-3/4 lg:w-1/2 mx-auto rounded-lg" alt="YouTube video with no chapters">

      <h3 class="text-2xl mt-6">To this:</h3>
      <img src="/with-chapters.png" class="w-3/4 lg:w-1/2 mx-auto rounded-lg" alt="YouTube video with chapters">
    </div>
    <TimestamperForm />
  </div>
</template>

<style scoped>
</style>
