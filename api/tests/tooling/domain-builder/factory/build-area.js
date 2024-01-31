import { Area } from '../../../../lib/domain/models/Area';

export function buildArea({
  id = 'recArea1',
  code = '1',
  color = 'colorArea1',
  competenceIds = ['recComp1', 'recComp2'],
  competenceAirtableIds = ['recAirComp1', 'recAirComp2'],
  frameworkId = 'recFramework1',
  title_i18n = { fr: 'titreArea1', en: 'titleArea1' },
} = {}) {
  return new Area({
    id,
    name: `${code}. ${title_i18n.fr}`,
    code,
    title_i18n,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  });
}
