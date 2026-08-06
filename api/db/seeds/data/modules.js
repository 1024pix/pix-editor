import bacASable from './modules/bac-a-sable.json' with { type: 'json' };
import demoCombinix1 from './modules/demo-combinix-1.json' with { type: 'json' };
import demoEpreuvesComponents from './modules/demo-epreuves-components.json' with { type: 'json' };
import { domainBuilder } from '../../../tests/test-helper.js';

export function buildModules(databaseBuilder) {
  const moduleBacASable = databaseBuilder.factory.buildModule({ ...bacASable, version: '1.0' });
  databaseBuilder.factory.buildModule({ ...demoCombinix1, version: '2.0' });
  databaseBuilder.factory.buildModule({ ...demoEpreuvesComponents, version: '3.0' });

  const draftModule = databaseBuilder.factory.buildDraftModule({ ...domainBuilder.buildDraftModule({ title: 'Draft module', version: '0.1' }) });
  const draftModuleBacASable = databaseBuilder.factory.buildDraftModule({ ...domainBuilder.buildDraftModule({ ...moduleBacASable, moduleId: moduleBacASable.id, title: '[DRAFT] Bac a sable', version: '1.1' }) });

  return [draftModule.id, draftModuleBacASable.id];
}
