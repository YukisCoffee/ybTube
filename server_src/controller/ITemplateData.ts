export default interface ITemplateData
{
    /** Main page variable, typically an object storing the page model. */
    page?: any;
    
    /** An ID used to identify this page type by the view. */
    pageId?: string;
}