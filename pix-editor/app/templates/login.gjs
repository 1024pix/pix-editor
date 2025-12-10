import LoginForm from 'pix-editor/components/login-form';
<template>
  <main class="login-page">
    <div class="login-page__container">
      <LoginForm @onLogInClicked={{@controller.authenticate}} />
    </div>
  </main>
</template>
