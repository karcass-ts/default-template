import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class Message1579358680737 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(new Table({
            name: 'message',
            columns: [
                { name: 'id', type: 'integer', isPrimary: true, isGenerated: true },
                { name: 'timestamp', type: 'bigint' },
                { name: 'text', type: 'text' },
            ],
            indices: [
                { name: 'idx_message_timestamp', columnNames: ['timestamp'] },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('message');
    }

}
