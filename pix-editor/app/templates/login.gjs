import LoginForm from 'pixeditor/components/login-form';
<template>
  <main class="login-page">
    <LoginForm @onLogInClicked={{@controller.authenticate}} />
  </main>
</template>
