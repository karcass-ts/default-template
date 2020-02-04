import CreateExpress, { Express } from 'express';
import { TwingEnvironment, TwingLoaderFilesystem } from 'twing';
import { Container } from '@karcass/container';
import { Cli } from '@karcass/cli';
import { Connection, createConnection } from 'typeorm';
import { CreateMigrationCommand, MigrateCommand, MigrateUndoCommand } from '@karcass/migration-commands';
import { createLogger } from './routines/createLogger';
import { Logger } from 'winston';
import { FrontPageController } from './SampleBundle/Controller/FrontPageController';
import { Message } from './SampleBundle/Entity/Message';
import { MessagesService } from './SampleBundle/Service/MessagesService';

export class Application {
    private container = new Container();
    private console = new Cli();
    private controllers: object[] = [];
    private http!: Express;

    public constructor(public readonly config: IConfig) { }

    public async run() {
        await this.initializeServices();

        if (process.argv[2]) {
            this.initializeCommands();
            await this.console.run();
        } else {
            this.runWebServer();
        }
    }

    protected runWebServer() {
        this.http = CreateExpress();
        this.http.use('/public', CreateExpress.static('public'));
        this.http.use(CreateExpress.urlencoded());
        this.http.listen(this.config.listen, () => console.log(`Listening on port ${this.config.listen}`));

        this.container.add<Express>('express', () => this.http);
        this.container.add(TwingEnvironment, () => new TwingEnvironment(new TwingLoaderFilesystem('src')));

        this.initializeControllers();
    }

    protected async initializeServices() {
        await this.container.addInplace<Logger>('logger', () => createLogger(this.config.logdir));
        const typeorm = await this.container.addInplace(Connection, () => createConnection({
            type: 'sqlite',
            database: 'db/example.sqlite',
            entities: ['build/**/Entity/*.js'],
            migrations: ['build/**/Migrations/*.js'],
            logging: ['error', 'warn', 'migration'],
        }));
        this.container.add('Repository<Message>', () => typeorm.getRepository(Message));
        this.container.add(MessagesService);
    }

    protected initializeCommands() {
        this.console.add(CreateMigrationCommand, () => new CreateMigrationCommand());
        this.console.add(MigrateCommand, async () => new MigrateCommand(await this.container.get(Connection)));
        this.console.add(MigrateUndoCommand, async () => new MigrateUndoCommand(await this.container.get(Connection)));
    }

    protected async initializeControllers() {
        this.controllers.push(
            this.container.inject(FrontPageController),
        );
    }

}
