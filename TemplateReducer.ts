import { execSync } from 'child_process';
import fs from 'fs';
import {
    AbstractTemplateReducer,
    ReplaceFileContentItem,
    ConfigParametersResult,
    ConfigParameterType,
    removeImports,
    removeCodeBlocks,
} from '@karcass/template-reducer';

enum Features {
    typeorm = 'typeorm',
    logger = 'logger',
    twing = 'twing',
}

enum InstallationType {
    default = 'default',
    select = 'select',
}

type InstallationConfig = {
    type: InstallationType
    tabSize: number
    semicolon: boolean
    singleQuotemark: boolean
    features: Features[]
    sample: boolean
    port: number
}

export class TemplateReducer extends AbstractTemplateReducer<InstallationConfig> {
    public config = {
        type: InstallationType.default,
        tabSize: 4,
        semicolon: true,
        singleQuotemark: true,
        features: [Features.logger, Features.twing, Features.typeorm],
        sample: true,
        port: Math.round(1000 + Math.random() * 60000),
    }

    public async getConfigParameters(): Promise<ConfigParametersResult> {
        return [
            { name: 'type', description: 'Select installation type', type: ConfigParameterType.radio, choices: [
                { value: 'default', description: 'Default', checked: true },
                { value: 'select', description: 'Configure' },
            ] },
            async (config: InstallationConfig) => config.type === 'select' && [
                { name: 'tabSize', description: 'Tab size', type: ConfigParameterType.number, default: 4 },
                {
                    name: 'singleQuotemark',
                    description: 'Use single quitemark (\') instead double (")?',
                    type: ConfigParameterType.confirm, default: this.config.singleQuotemark,
                },
                {
                    name: 'semicolon',
                    description: 'Semicolons at end of the lines?',
                    type: ConfigParameterType.confirm,
                    default: this.config.semicolon,
                },
                { name: 'features', description: 'Select features', type: ConfigParameterType.checkbox, choices: [
                    {
                        value: 'typeorm',
                        description: 'TypeORM for DB (required for sample page)',
                        checked: this.config.features.includes(Features.typeorm),
                    },
                    {
                        value: 'logger',
                        description: 'Logger for logs',
                        checked: this.config.features.includes(Features.logger),
                    },
                    {
                        value: 'twing',
                        description: 'Twing for HTML (required for sample page)',
                        checked: this.config.features.includes(Features.twing),
                    },
                ] },
                async (config: InstallationConfig) => {
                    if (config.features.includes(Features.typeorm) && config.features.includes(Features.twing)) {
                        return { name: 'sample', description: 'Create sample?', type: ConfigParameterType.confirm, default: true };
                    } else {
                        this.setConfig({ sample: false });
                        return undefined;
                    }
                },
                { name: 'port', description: 'Listening port', type: ConfigParameterType.number, default: this.config.port },
            ],
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
                    content = removeImports(content,
                        'FrontPageController',
                        'Message',
                        'MessagesService',
                    );
                    content = removeCodeBlocks(content,
                        'this.container.add(\'Repository<Message>\'',
                        'this.container.add(MessagesService);',
                        'protected async initializeControllers(',
                        'this.initializeControllers(',
                    );
                    content = content.replace('const typeorm = ', '');
                }
                if (!this.config.features.includes(Features.typeorm)) {
                    content = removeImports(content,
                        'Connection',
                        'createConnection',
                        'CreateMigrationCommand',
                        'MigrateCommand',
                        'MigrateUndoCommand',
                    );
                    content = removeCodeBlocks(content,
                        'await this.container.addInplace(Connection',
                        'protected initializeCommands(',
                        'this.initializeCommands(',
                    );
                }
                if (!this.config.features.includes(Features.logger)) {
                    content = removeImports(content,
                        'Logger',
                        'createLogger',
                    );
                    content = removeCodeBlocks(content,
                        'await this.container.addInplace<Logger>',
                    );
                }
                if (!this.config.features.includes(Features.twing)) {
                    content = removeImports(content,
                        'TwingEnvironment',
                        'TwingLoaderFilesystem',
                    );
                    content = removeCodeBlocks(content,
                        'this.container.add(TwingEnvironment',
                    );
                }
                if (!this.config.features.includes(Features.logger) && !this.config.features.includes(Features.typeorm)) {
                    content = removeCodeBlocks(content,
                        'protected async initializeServices()',
                        'await this.initializeServices();',
                    );
                }
                return content;
            } },
            { filename: 'config.js.dist', replacer: async (content: string) => {
                content = content.replace('1000000000', String(this.config.port));
                if (!this.config.features.includes(Features.logger)) {
                    content = removeCodeBlocks(content, 'logdir:');
                }
                if (!this.config.features.includes(Features.typeorm)) {
                    content = removeCodeBlocks(content, 'db:');
                }
                return content;
            } },
            { filename: '.eslintrc.json', replacer: async (content: string) => {
                const json = JSON.parse(content);
                json.rules.indent = json.rules['@typescript-eslint/indent'] = ['error', this.config.tabSize, { 'SwitchCase': 1 }];
                json.rules.semi = ['error', this.config.semicolon ? 'always' : 'never'];
                json.rules.quotes = ['error', this.config.singleQuotemark ? 'single' : 'double'];
                return JSON.stringify(json, undefined, 4);
            } },
        ];
    }

    public async finish() {
        if (!fs.existsSync('config.js')) {
            fs.copyFileSync('config.js.dist', 'config.js');
        }
        console.log('> Linting code...');
        execSync('npm run lint', { stdio: 'inherit' });
        console.log('> Building sources...');
        execSync('npm run build');
        if (this.config.sample) {
            console.log('> Applying sample db migrations by executing "node index.js migrations:migrate" command...');
            execSync('node index.js migrations:migrate', { stdio: 'inherit' });
        }
        console.log('> Installation complete!');
        console.log('> The application installed into ' + this.directoryPath);
        console.log(`> To start it go to the application directory by executing "cd ${this.directoryName}" ` +
            'then run it with "node index.js" command.');
    }

    public async getTestConfigSet() {
        const baseConfig = {
            type: InstallationType.default,
            tabSize: 4,
            semicolon: true,
            singleQuotemark: true,
            features: [Features.logger, Features.twing, Features.typeorm],
            sample: true,
            port: Math.round(1000 + Math.random() * 60000),
        };
        return [
            baseConfig,
            {
                ...baseConfig,
                type: InstallationType.select,
                tabSize: 2,
                semicolon: false,
                features: [Features.twing, Features.typeorm],
            },
            {
                ...baseConfig,
                type: InstallationType.select,
                semicolon: false,
                singleQuotemark: false,
                features: [Features.typeorm],
            },
            {
                ...baseConfig,
                type: InstallationType.select,
                features: [],
            },
            {
                ...baseConfig,
                type: InstallationType.select,
                features: [Features.logger],
                sample: false,
            },
            {
                ...baseConfig,
                type: InstallationType.select,
                features: [Features.logger, Features.twing],
            },
            {
                ...baseConfig,
                type: InstallationType.select,
                features: [Features.logger, Features.typeorm],
            },
            {
                ...baseConfig,
                type: InstallationType.select,
                features: [Features.twing],
            },
        ];
    }

}
