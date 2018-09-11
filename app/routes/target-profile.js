import Route from '@ember/routing/route';
import {inject as service} from "@ember/service";

export default Route.extend({
  paginatedQuery:service(),
  model() {
    let areas = this.modelFor('application');
    let pq = this.get("paginatedQuery");
    return pq.query("tube", {sort:[{field: "Nom", direction: "asc"}]})
    .then(tubes => {
      tubes.forEach(tube => {
        tube.set('selectedLevel', false);
        tube.set('selectedSkills', []);
      });
      areas.forEach(area => {
        area.get('competences').forEach(competence => {
          competence.set('tubes2', tubes.filter(tube => {
            let ids = tube.get('competenceIds');
            return ids && (ids[0] == competence.id);
          }));
        });
      });
      return areas;
    });
  }
});
