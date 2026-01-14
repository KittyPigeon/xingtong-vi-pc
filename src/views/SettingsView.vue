<template>
  <div class="container">
    <InputNumber v-model="value1" input-id="integeronly" fluid />
    <SelectButton v-model="value" :options="options" />
  </div>
</template>

<script setup>
  import InputNumber from 'primevue/inputnumber';
  import SelectButton from 'primevue/selectbutton';

  import { ref } from 'vue';
  const value1 = ref(1);
  const value = ref('New York');
  const options = ref(['New York', 'Rome', 'London', 'Sydney']);
</script>
<style scoped lang="less"></style>
