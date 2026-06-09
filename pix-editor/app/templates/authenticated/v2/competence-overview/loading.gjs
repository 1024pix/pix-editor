import { hash } from '@ember/helper';
import ChallengesProductionHeader from 'pixeditor/components/challenges-production/challenges-production-header';
import Loader from 'pixeditor/components/loader';

<template>
  <ChallengesProductionHeader @skill={{hash name="Chargement..." version="euillez patienter..."}} />
  <div class="challenges-production-loader">
    <Loader />
  </div>
</template>
