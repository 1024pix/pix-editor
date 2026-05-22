import bacASable from './modules/bac-a-sable.json' with { type: 'json' };
import demoCombinix1 from './modules/demo-combinix-1.json' with { type: 'json' };
import demoCombinix2 from './modules/demo-combinix-2.json' with { type: 'json' };
import demoEpreuvesComponents from './modules/demo-epreuves-components.json' with { type: 'json' };
import demoLLM from './modules/demo-llm.json' with { type: 'json' };
import { domainBuilder } from '../../../tests/test-helper.js';

export function buildModules(databaseBuilder) {
  const moduleBacASable = databaseBuilder.factory.buildModule(bacASable);
  databaseBuilder.factory.buildModule(demoCombinix1);
  databaseBuilder.factory.buildModule(demoCombinix2);
  databaseBuilder.factory.buildModule(demoEpreuvesComponents);
  databaseBuilder.factory.buildModule(demoLLM);

  databaseBuilder.factory.buildDraftModule({ ...domainBuilder.buildDraftModule({ title: 'Draft module' }) });
  databaseBuilder.factory.buildDraftModule({ ...domainBuilder.buildDraftModule({ ...moduleBacASable, moduleId: moduleBacASable.id, title: '[DRAFT] Bac a sable' }) });
}
