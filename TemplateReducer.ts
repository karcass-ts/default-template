import { AbstractTemplateReducer, BasicInstallationConfig, ReplaceFileContentItem, ConfigParametersResult, ConfigParameterType }
    from '@karcass/template-reducer';

enum Features {
    typeorm = 'typeorm',
    logger = 'logger',
    twing = 'twing',
}

type InstallationConfig = BasicInstallationConfig & {
    features: Features[]
    sample: boolean
    port: number
}

export class TemplateReducer extends AbstractTemplateReducer {
    public config: InstallationConfig

    public async getConfigParameters(): Promise<ConfigParametersResult> {
        return [
            { name: 'features', description: 'Select features', type: ConfigParameterType.checkbox, choices: [
                { value: 'typeorm', description: 'TypeORM for DB (required for sample page)', checked: true },
                { value: 'logger', description: 'Logger for logs', checked: true },
                { value: 'twing', description: 'Twing for HTML (required for sample page)', checked: true },
            ] },
            async (config: InstallationConfig) => {
                if (config.features.includes(Features.typeorm) && config.features.includes(Features.twing)) {
                    return { name: 'sample', description: 'Create sample?', type: ConfigParameterType.confirm, default: true };
                } else {
                    return undefined;
                }
            },
            { name: 'port', description: 'Listening port', type: ConfigParameterType.number,
                default: Math.round(1000 + Math.random() * 60000) },
        ];
    }

    public async getDirectoriesForRemove() {
        const result: string[] = [];
        if (!this.config.sample) {
            result.push('src/SampleBundle');
        }
        if (!this.config.features.includes(Features.logger)) {
            result.push('src/routines');
        }
        return result;
    }

    public async getFilesForRemove() {
        return [];
    }

    public async getDependenciesForRemove() {
        const result = [];
        if (!this.config.features.includes(Features.typeorm)) {
            result.push('typeorm', 'pg', '@karcass/migration-commands');
        }
        if (!this.config.features.includes(Features.logger)) {
            result.push('winston', 'winston-daily-rotate-file');
        }
        if (!this.config.features.includes(Features.twing)) {
            result.push('@types/luxon', 'twing');
        }
        return result;
    }

    public async getFilesContentReplacers(): Promise<ReplaceFileContentItem[]> {
        return [
            { filename: 'src/Application.ts', replacer: async (content: string) => {
                if (!this.config.sample) {
                    content = this.removeImports(content,
                        'FrontPageController',
                        'Message',
                        'MessageService',
                    );
                    content = this.removeCodeBlocks(content,
                        'this.container.add(\'Repository<Message>\'',
                        'this.container.add(MessagesService);',
                        'this.controllers.push(',
                    );
                }
                if (!this.config.features.includes(Features.typeorm)) {
                    content = this.removeImports(content,
                        'Connection',
                        'createConnection',
                        'CreateMigrationCommand',
                        'MigrateCommand',
                        'MigrateUndoCommand',
                    );
                    content = this.removeCodeBlocks(content,
                        'await this.container.addInplace(Connection',
                        'this.console.add(CreateMigrationCommand,',
                        'this.console.add(MigrateCommand,',
                        'this.console.add(MigrateUndoCommand,',
                    );
                }
                if (!this.config.features.includes(Features.logger)) {
                    content = this.removeImports(content,
                        'Logger',
                        'createLogger',
                    );
                    content = this.removeCodeBlocks(content,
                        'await this.container.addInplace<Logger>',
                    );
                }
                if (!this.config.features.includes(Features.logger)) {
                    content = this.removeImports(content,
                        'TwingEnvironment',
                        'TwingLoaderFilesystem',
                    );
                    content = this.removeCodeBlocks(content,
                        'this.container.add(TwingEnvironment',
                    );
                }
                return content;
            } },
            { filename: 'config.js.dist', replacer: async (content: string) => {
                content = content.replace('1000000000', String(this.config.port));
                if (!this.config.features.includes(Features.logger)) {
                    content = this.removeCodeBlocks(content, 'logdir:');
                }
                if (!this.config.features.includes(Features.typeorm)) {
                    content = this.removeCodeBlocks(content, 'db:');
                }
                return content;
            } },
        ];
    }

}
