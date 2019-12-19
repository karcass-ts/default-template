import Express from 'express';
import { Container } from '@karcass/container';
import { DbService } from './Database/Service/DbService';
import { LoggerService } from './Logger/Service/LoggerService';
import { CreateMigrationCommand } from './Database/Console/CreateMigrationCommand';
import { MigrateCommand } from './Database/Console/MigrateCommand';
import { MigrateUndoCommand } from './Database/Console/MigrateUndoCommand';
import { CliService } from '@karcass/cli-service';

export class Application {
    private services = new Container();
    private cliService = new CliService()
    public http!: Express.Express;

    public constructor(public readonly config: IConfig) { }

    public async run() {
        this.initializeServices();

        if (process.argv[2]) {
            this.initializeCommands();
            await this.cliService.run();
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
        this.cliService.add(CreateMigrationCommand, () => new CreateMigrationCommand());
        this.cliService.add(MigrateCommand, () => new MigrateCommand(this.services.get(DbService)));
        this.cliService.add(MigrateUndoCommand, () => new MigrateUndoCommand(this.services.get(DbService)));
    }

    protected initializeControllers() { /**/ }

}
