import { AbstractConsoleCommand } from './AbstractConsoleCommand';

export class HelpCommand extends AbstractConsoleCommand {

    public constructor(protected commands: (new (...args: any[]) => AbstractConsoleCommand)[]) {
        super();
    }

    public static getMeta() {
        return { name: '--help', description: 'Show this help' };
    }

    public async execute(): Promise<void> {
        console.log('\n=== Available commands: ===');
        const commands = this.commands.map(command => {
            const getMeta = (command as any).getMeta;
            if (!getMeta) {
                throw new Error(`There is no getMeta static method on ${command}`);
            }
            return getMeta.call(command) as { name: string, description: string, usage?: string };
        }).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        const maxLength = Math.max(...commands.map((c) => c.usage ? c.usage.length : c.name.length));

        for (const command of commands) {
            console.log('  ' +
                (command.usage ? command.usage : command.name).padEnd(maxLength) +
                `  ${command.description}`);
        }
    }

}
