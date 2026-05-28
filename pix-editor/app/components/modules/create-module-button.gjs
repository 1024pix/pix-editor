import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';

<template>
  <PixButtonLink @route="authenticated.modules.new" class="pix-button-link-with-icon white-font">
    <PixIcon @name="add" @ariaHidden={{true}} />
    Créer un module
  </PixButtonLink>
</template>
