import { emptyAllTables } from '../../db/knex-database-connection.js';

console.log('Emptying all tables...');
emptyAllTables()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  });
