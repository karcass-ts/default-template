import { AbstractConsoleCommand } from '@karcass/cli-service';
import { DbService } from '../Service/DbService';

export class MigrateUndoCommand extends AbstractConsoleCommand {
    public static meta = { name: 'migrations:migrate:undo', description: 'Undoing last migration' };

    public constructor(protected dbService: DbService) {
        super();
    }

    public async execute() {
        await this.dbService.onConnect();
        await this.dbService.collectMigrations();
        const migrations = await this.dbService.connection.query('SELECT * FROM migrations');
        if (!migrations.length) {
            console.log('There is no migrations to undo');
            return;
        }
        try {
            await this.dbService.connection.undoLastMigration();
        } catch (err) {
            console.log(err);
            return;
        }
        console.log(`Migration ${migrations[migrations.length - 1].name} reverted`);
    }

}
