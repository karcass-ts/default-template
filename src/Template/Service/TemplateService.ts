import { TwingEnvironment, TwingLoaderFilesystem } from 'twing';

export class TemplateService {
    public twig: TwingEnvironment;

    public constructor() {
        this.twig = new TwingEnvironment(new TwingLoaderFilesystem('./src'));
    }

    public render(template: string, params: { [key: string]: any } = {}): string {
        return this.twig.render(template, params);
    }

}
