import { AbstractConsoleCommand } from '@karcass/cli-service';
import { Migration } from 'typeorm/migration/Migration';
import { DbService } from '../Service/DbService';

export class MigrateCommand extends AbstractConsoleCommand {
    public static meta = { name: 'migrations:migrate', description: 'Perform migrations' };

    public constructor(protected dbService: DbService) {
        super();
    }

    public async execute() {
        await this.dbService.onConnect();
        await this.dbService.collectMigrations();
        let migrations: Migration[];
        try {
            migrations = await this.dbService.connection.runMigrations();
        } catch (err) {
            console.log(err);
            return;
        }

        if (migrations.length) {
            for (const migration of migrations) {
                console.log(`Migration ${migration.name} applied`);
            }
        } else {
            console.log('No new migrations');
        }
    }

}
