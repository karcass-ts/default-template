export enum ConsoleColors {
    Reset = '\x1b[0m',
    Bright = '\x1b[1m',
    Dim = '\x1b[2m',
    Underscore = '\x1b[4m',
    Blink = '\x1b[5m',
    Reverse = '\x1b[7m',
    Hidden = '\x1b[8m',

    FgBlack = '\x1b[30m',
    FgRed = '\x1b[31m',
    FgGreen = '\x1b[32m',
    FgYellow = '\x1b[33m',
    FgBlue = '\x1b[34m',
    FgMagenta = '\x1b[35m',
    FgCyan = '\x1b[36m',
    FgWhite = '\x1b[37m',

    BgBlack = '\x1b[40m',
    BgRed = '\x1b[41m',
    BgGreen = '\x1b[42m',
    BgYellow = '\x1b[43m',
    BgBlue = '\x1b[44m',
    BgMagenta = '\x1b[45m',
    BgCyan = '\x1b[46m',
    BgWhite = '\x1b[47m',
}

export abstract class AbstractConsoleCommand {

    public static getMeta(): { name: string, description: string, usage?: string } {
        throw new Error(`getMeta static method is not implemented in ${this.name}`);
    }

    public abstract async execute(): Promise<void>

    protected colorize(color: ConsoleColors, text: string) {
        return `${color}${text}${ConsoleColors.Reset}`;
    }

    protected writeLn(text: string, color: ConsoleColors = ConsoleColors.Reset) {
        console.log(this.colorize(color, text));
    }

    protected write(text: string, color: ConsoleColors = ConsoleColors.Reset) {
        process.stdout.write(this.colorize(color, text));
    }

    protected readLn(): Promise<string> {
        return new Promise((r) => {
            process.stdout.once('data', (d: Buffer) => r(d.toString()));
        });
    }

    protected hasKey(key: string) {
        return !!this.getKeyValue(key);
    }

    protected getKeyValue(key: string): undefined|string|true {
        for (let k of process.argv.slice(3)) {
            k = k.trim();
            if (k.indexOf('--') === 0) {
                if (k === `--${key}`) {
                    return true;
                }
                if (k.indexOf(`--${key}=`) === 0) {
                    return k.substr(`--${key}=`.length);
                }
            }
        }
    }

}
