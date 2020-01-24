"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const twing_1 = require("twing");
const container_1 = require("@karcass/container");
const cli_1 = require("@karcass/cli");
const typeorm_1 = require("typeorm");
const migration_commands_1 = require("@karcass/migration-commands");
const createLogger_1 = require("./routines/createLogger");
const FrontPageController_1 = require("./ExampleBundle/Controller/FrontPageController");
const Message_1 = require("./ExampleBundle/Entity/Message");
const MessagesService_1 = require("./ExampleBundle/Service/MessagesService");
class Application {
    constructor(config) {
        this.config = config;
        this.container = new container_1.Container();
        this.console = new cli_1.Cli();
        this.controllers = [];
    }
    async run() {
        await this.initializeServices();
        if (process.argv[2]) {
            this.initializeCommands();
            await this.console.run();
        }
        else {
            this.runWebServer();
        }
    }
    runWebServer() {
        this.http = express_1.default();
        this.http.use('/public', express_1.default.static('public'));
        this.http.use(express_1.default.urlencoded());
        this.http.listen(this.config.listen, () => console.log(`Listening on port ${this.config.listen}`));
        this.container.add('express', () => this.http);
        this.container.add(twing_1.TwingEnvironment, () => new twing_1.TwingEnvironment(new twing_1.TwingLoaderFilesystem('src')));
        this.initializeControllers();
    }
    async initializeServices() {
        await this.container.addInplace('logger', () => createLogger_1.createLogger());
        const typeorm = await this.container.addInplace(typeorm_1.Connection, () => typeorm_1.createConnection({
            type: 'sqlite',
            database: 'db/example.sqlite',
            entities: ['build/**/Entity/*.js'],
            migrations: ['build/**/Migrations/*.js'],
            logging: ['error', 'warn', 'migration'],
        }));
        this.container.add('Repository<Message>', () => typeorm.getRepository(Message_1.Message));
        this.container.add(MessagesService_1.MessagesService);
    }
    initializeCommands() {
        this.console.add(migration_commands_1.CreateMigrationCommand, () => new migration_commands_1.CreateMigrationCommand());
        this.console.add(migration_commands_1.MigrateCommand, async () => new migration_commands_1.MigrateCommand(await this.container.get(typeorm_1.Connection)));
        this.console.add(migration_commands_1.MigrateUndoCommand, async () => new migration_commands_1.MigrateUndoCommand(await this.container.get(typeorm_1.Connection)));
    }
    async initializeControllers() {
        this.controllers.push(this.container.inject(FrontPageController_1.FrontPageController));
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map