import fs from 'fs';
import { Connection, createConnection, ConnectionOptions } from 'typeorm';
import path from 'path';

export class DbService {
    public connection!: Connection;

    public constructor(protected options: ConnectionOptions) {
        createConnection({
            ...options,
            migrationsTableName: 'migrations',
            entities: ['dist/**/Entity/*.js'],
            logging: ['error', 'warn', 'migration'],
        }).then(async (connection) => {
            this.connection = connection;
        }).catch((err: any) => {
            throw err;
        });
    }

    public onConnect() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.connection) {
                    resolve();
                    clearInterval(interval);
                }
            }, 10);
        });
    }

    public async collectMigrations() {
        const bundlesDirs = fs.readdirSync('src').filter(i => fs.lstatSync(path.join('src', i)).isDirectory());
        const migrations: { filepath: string, timestamp: number }[] = [];
        for (const bundleDir of bundlesDirs) {
            const migrationsDir = path.join('src', bundleDir, 'Migrations');
            if (!fs.existsSync(migrationsDir)) {
                continue;
            }
            for (const migration of fs.readdirSync(migrationsDir).filter(subi => /\.ts$/.test(subi))) {
                const timestamp = migration.match(/[0-9]+/);
                migrations.push({ filepath: path.join(bundleDir, 'Migrations', migration), timestamp: timestamp ? Number(timestamp) : 0 });
            }
        }
        migrations.sort((a, b) => a.timestamp - b.timestamp);
        for (const migration of migrations) {
            const jsFileName = path.join('..', '..', migration.filepath.replace('.ts', ''));
            this.connection.migrations.push(new (await import(jsFileName)).default());
        }
    }

}
