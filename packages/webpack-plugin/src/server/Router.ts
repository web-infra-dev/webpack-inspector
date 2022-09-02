import { cleanUrl } from '@/utils';
import connect from 'connect';
export type RequestMethod = 'GET' | 'POST';
// A simple router to respond to requests.
export class Router {
  #handlersMap: Record<RequestMethod, Record<string, connect.NextHandleFunction>>;

  constructor() {
    this.#handlersMap = {
      GET: {},
      POST: {}
    };
  }
  get(path: string, handler: connect.NextHandleFunction) {
    const { GET: getHandersMap } = this.#handlersMap;
    getHandersMap[path] = handler;
  }

  post(path: string, handler: connect.NextHandleFunction) {
    const { POST: postHandersMap } = this.#handlersMap;
    postHandersMap[path] = handler;
  }

  routes(): connect.NextHandleFunction {
    return async (req, res, next) => {
      const { method, url } = req;
      const cleanedUrl = cleanUrl(url);
      const handler = this.#handlersMap[method][cleanedUrl];
      if (handler) {
        return handler(req, res, next);
      } else {
        return next();
      }
    }
  }
}
