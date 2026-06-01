import Module from './module';

export default class DraftModule extends Module {
  get mayShowProductionDetails() {
    // FIXME must return true if draft belongs to an existing module
    return false;
  }

  get mayShowDraftDetails() {
    return true;
  }
}
