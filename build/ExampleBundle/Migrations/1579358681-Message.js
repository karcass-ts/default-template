"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
class Message1579358680737 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
    async down(queryRunner) {
        await queryRunner.dropTable('message');
    }
}
exports.default = Message1579358680737;
//# sourceMappingURL=1579358681-Message.js.map