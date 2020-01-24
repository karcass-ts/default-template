"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const container_1 = require("@karcass/container");
let MessagesService = class MessagesService {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async isEmpty() {
        return !await this.messageRepository.count();
    }
    async createSampleMessages() {
        await this.addMessage('First message');
        await this.addMessage('Second message');
    }
    async getMessages() {
        return this.messageRepository.find({ order: { timestamp: 'ASC' } });
    }
    async addMessage(text) {
        return this.messageRepository.save(this.messageRepository.create({
            timestamp: Math.floor(Date.now() / 1000),
            text,
        }));
    }
};
MessagesService = __decorate([
    __param(0, container_1.Dependency('Repository<Message>')),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], MessagesService);
exports.MessagesService = MessagesService;
//# sourceMappingURL=MessagesService.js.map