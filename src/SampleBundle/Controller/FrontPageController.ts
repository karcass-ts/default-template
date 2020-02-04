import { Express } from 'express';
import { Dependency } from '@karcass/container';
import { TwingEnvironment } from 'twing';
import { AbstractController, QueryData } from './AbstractController';
import { MessagesService } from '../Service/MessagesService';

export class FrontPageController extends AbstractController {

    public constructor(
        @Dependency('express') protected express: Express,
        @Dependency(TwingEnvironment) protected twing: TwingEnvironment,
        @Dependency(MessagesService) protected messagesService: MessagesService,
    ) {
        super(express);

        this.onQuery('/', 'get', this.frontPageAction);
        this.onQuery('/', 'post', this.sendMessageAction);
    }

    public async sendMessageAction(data: QueryData) {
        await this.messagesService.addMessage(data.params.text);
        data.res.redirect('/');
    }

    public async frontPageAction() {
        if (await this.messagesService.isEmpty()) {
            this.messagesService.createSampleMessages();
        }
        return this.twing.render('ExampleBundle/Views/front.twig', {
            messages: await this.messagesService.getMessages(),
        });
    }

}
