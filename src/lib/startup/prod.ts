import { Express, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";

export default function prod(app: Express) {
  function shouldCompress(req: Request, res: Response) {
    if (req.headers["x-no-compression"]) {
      // don't compress responses with this request header
      return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
  }
  app.use(compression({ filter: shouldCompress }));
  app.use(helmet());
}
