import { Express, Response, Request } from 'express';

export interface QueryData {
    params: Record<string, any>
    req: Request
    res: Response
}

export class AbstractController {

    public constructor(protected express: Express) {}

    protected onQuery(url: string, type: 'get'|'post', callback: (data: QueryData) => Promise<any>) {
        this.express[type](url, async (req: Request, res: Response) => {
            try {
                const result = await callback.call(this, { req, res, params: type === 'post' ? req.body : req.query });
                res.send(result);
            } catch (err) {
                res.statusCode = 500;
                res.send(`<html><body><h1>error 500</h1><p>${err.message}</p></body></html>`);
            }
        });
    }

}