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
let MessagesController = class MessagesController extends AbstractController_1.AbstractController {
    constructor(express, twing) {
        super(express);
        this.express = express;
        this.twing = twing;
        this.onQuery('/', 'get', this.frontPageAction);
    }
    async frontPageAction() {
        return this.twing.render('ExampleBundle/Views/front.twig');
    }
};
MessagesController = __decorate([
    __param(0, container_1.Dependency('express')),
    __param(1, container_1.Dependency(twing_1.TwingEnvironment)),
    __metadata("design:paramtypes", [Function, twing_1.TwingEnvironment])
], MessagesController);
exports.MessagesController = MessagesController;
//# sourceMappingURL=MessagesController.js.map