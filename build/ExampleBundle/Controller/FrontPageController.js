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
const container_1 = require("@karcass/container");
const twing_1 = require("twing");
const AbstractController_1 = require("./AbstractController");
const MessagesService_1 = require("../Service/MessagesService");
let FrontPageController = class FrontPageController extends AbstractController_1.AbstractController {
    constructor(express, twing, messagesService) {
        super(express);
        this.express = express;
        this.twing = twing;
        this.messagesService = messagesService;
        this.onQuery('/', 'get', this.frontPageAction);
        this.onQuery('/', 'post', this.sendMessageAction);
    }
    async sendMessageAction(data) {
        await this.messagesService.addMessage(data.params.text);
        data.res.redirect('/');
    }
    async frontPageAction() {
        if (await this.messagesService.isEmpty()) {
            this.messagesService.createSampleMessages();
        }
        return this.twing.render('ExampleBundle/Views/front.twig', {
            messages: await this.messagesService.getMessages(),
        });
    }
};
FrontPageController = __decorate([
    __param(0, container_1.Dependency('express')),
    __param(1, container_1.Dependency(twing_1.TwingEnvironment)),
    __param(2, container_1.Dependency(MessagesService_1.MessagesService)),
    __metadata("design:paramtypes", [Function, twing_1.TwingEnvironment,
        MessagesService_1.MessagesService])
], FrontPageController);
exports.FrontPageController = FrontPageController;
//# sourceMappingURL=FrontPageController.js.map