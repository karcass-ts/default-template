import { Repository } from 'typeorm';
import { Message } from '../Entity/Message';
import { Dependency } from '@karcass/container';

export class MessagesService {

    public constructor(
        @Dependency('Repository<Message>') protected messageRepository: Repository<Message>,
    ) {}

    public async isEmpty() {
        return !await this.messageRepository.count();
    }

    public async createSampleMessages() {
        await this.addMessage('First message');
        await this.addMessage('Second message');
    }

    public async getMessages() {
        return this.messageRepository.find({ order: { timestamp: 'ASC' } });
    }

    public async addMessage(text: string) {
        return this.messageRepository.save(this.messageRepository.create({
            timestamp: Math.floor(Date.now() / 1000),
            text,
        }));
    }

}