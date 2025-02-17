declare module 'csurf' {
    import { RequestHandler } from "express";
    function csurf(options?: any): RequestHandler;
    export = csurf;
}