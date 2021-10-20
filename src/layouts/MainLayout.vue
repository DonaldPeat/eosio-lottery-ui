<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Telos Lottery
        </q-toolbar-title>
        <login-button></login-button>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import LoginButton from "components/LoginButton.vue";

const pagesData = [
  {
    title: "Transfer",
    caption: "Transfer example, sending/signing actions",
    icon: "send",
    path: "/transfer"
  }
];

export default {
  name: "MainLayout",
  components: { LoginButton },
  data() {
    return {
      examplePages: pagesData
    };
  }
};
</script>
