import DS from 'ember-data';
import Note from "./note";

export default Note.extend({
  changelog:DS.attr("boolean", {defaultValue: true })
});
