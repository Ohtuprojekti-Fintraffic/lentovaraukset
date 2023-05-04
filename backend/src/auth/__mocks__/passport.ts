export default {
  initialize: () => (_req: any, _res: any, next: any) => next(),
  session: () => (_req: any, _res: any, next: any) => next(),
  authenticate: () => (_req: any, _res: any, next: any) => {
    next();
  },
};
