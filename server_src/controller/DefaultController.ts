import { Request, Response } from "express"; // Import types
import ITemplateData from "controller/ITemplateData";

export default class DefaultController
{
    pageTemplate: string = "main.njk";

    static async handle(request: Request, response: Response): Promise<void>
    {
        // response.render(this.pageTemplate);
    }
}