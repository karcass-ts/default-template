import Express from 'express';
import { Container } from '@karcass/container';
import { AbstractConsoleCommand } from './Base/Console/AbstractConsoleCommand';
import { DbService } from './Database/Service/DbService';
import { HelpCommand } from './Base/Console/HelpCommand';
import { LoggerService } from './Logger/Service/LoggerService';
import { CreateMigrationCommand } from './Database/Console/CreateMigrationCommand';
import { MigrateCommand } from './Database/Console/MigrateCommand';
import { MigrateUndoCommand } from './Database/Console/MigrateUndoCommand';

export class Application {
    private services = new Container();
    private commands = new Container<AbstractConsoleCommand>();
    public http!: Express.Express;

    public constructor(public readonly config: IConfig) { }

    public async run() {
        this.initializeServices();

        if (process.argv[2]) {
            this.initializeCommands();
            for (const command of this.commands.getConstructors()) {
                const getMeta = (command as any).getMeta;
                if (!getMeta) {
                    throw new Error(`There is no getMeta static method on ${command}`);
                }
                const meta: { name: string } = getMeta.call(command);
                if (meta.name === process.argv[2]) {
                    await this.commands.get(command).execute();
                    process.exit();
                }
            }
            await this.commands.get(HelpCommand).execute();
            process.exit();
        } else {
            this.runWebServer();
        }
    }

    protected runWebServer() {
        this.http = Express();
        this.http.use('/public', Express.static('public'));
        this.http.use(Express.urlencoded());
        this.http.listen(this.config.listen, () => console.log(`Listening on port ${this.config.listen}`));

        this.initializeControllers();
    }

    protected initializeServices() {
        this.services.add(LoggerService, () => new LoggerService(this.config.logdir));
        this.services.add(DbService, () => new DbService({
            type: 'postgres',
            database: this.config.db.name,
            username: this.config.db.user,
            password: this.config.db.password,
        }));
    }

    protected initializeCommands() {
        this.commands.add(HelpCommand, () => new HelpCommand(this.commands.getConstructors()));
        this.commands.add(CreateMigrationCommand, () => new CreateMigrationCommand());
        this.commands.add(MigrateCommand, () => new MigrateCommand(this.services.get(DbService)));
        this.commands.add(MigrateUndoCommand, () => new MigrateUndoCommand(this.services.get(DbService)));
    }

    protected initializeControllers() { /**/ }

}
