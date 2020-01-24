"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractController {
    constructor(express) {
        this.express = express;
    }
    onQuery(url, type, callback) {
        this.express[type](url, async (req, res) => {
            try {
                const result = await callback.call(this, { req, res, params: type === 'post' ? req.body : req.query });
                res.send(result);
            }
            catch (err) {
                res.statusCode = 500;
                res.send(`<html><body><h1>error 500</h1><p>${err.message}</p></body></html>`);
            }
        });
    }
}
exports.AbstractController = AbstractController;
//# sourceMappingURL=AbstractController.js.map