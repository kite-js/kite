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
Object.defineProperty(exports, "__esModule", { value: true });
const kite_1 = require("../../kite");
let UserModel = class UserModel {
    constructor() {
        this.createdTime = new Date();
    }
};
__decorate([
    kite_1.In({
        required: true
    }),
    __metadata("design:type", String)
], UserModel.prototype, "name", void 0);
__decorate([
    kite_1.In({
        required: true
    }),
    __metadata("design:type", String)
], UserModel.prototype, "password", void 0);
__decorate([
    kite_1.In(),
    __metadata("design:type", Date)
], UserModel.prototype, "createdTime", void 0);
UserModel = __decorate([
    kite_1.Model()
], UserModel);
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map