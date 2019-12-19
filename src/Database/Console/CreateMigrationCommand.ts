import { AbstractConsoleCommand } from '../../Base/Console/AbstractConsoleCommand';
import fs from 'fs';

export class CreateMigrationCommand extends AbstractConsoleCommand {

    public static getMeta() {
        return { name: 'migrations:generate', description: 'name (Bundle/MigrationName) Creates migration with name from argument' };
    }

    public async execute() {
        const name = process.argv[3].split('/');

        if (name.length !== 2) {
            console.error('You must provide name for new migration with following format: Bundle/MigrationName, ' +
                'for example "Content/News"');
            return;
        }
        const stamp = Date.now();
        const timestamp = Math.round(stamp / 1000);
        const dirname = `src/${name[0]}/Migrations`;
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
        }
        const filename = `${dirname}/${timestamp}-${name[1]}.ts`;
        let str = 'import { MigrationInterface, QueryRunner } from \'typeorm\'\n\n';
        str += `export default class ${name[1]}${stamp} implements MigrationInterface {\n\n`;
        str += '    public async up(queryRunner: QueryRunner): Promise<any> {}\n\n';
        str += '    public async down(queryRunner: QueryRunner): Promise<any> {}\n\n';
        str += '}\n';
        fs.writeFileSync(filename, str);

        console.log(`New migration placed into ${filename}`);
    }

}
