import {
  OIDCStrategy,
  VerifyOIDCFunctionWithReq,
  IOIDCStrategyOptionWithRequest,
  IProfile,
  VerifyCallback,
} from 'passport-azure-ad';
import passport from 'passport';
import { Request } from 'express';

import { config } from 'dotenv';

config();

// array to hold logged in users
const users: IProfile[] = [];

const findByOid = (
  oid: string | undefined,
  fn: (err: Error | null, user: IProfile | null) => void,
) => {
  for (let i = 0, len = users.length; i < len; i += 1) {
    const user = users[i];
    console.log('we are using user: ', user);
    if (user.oid === oid) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

passport.serializeUser((user: IProfile, done) => {
  console.log('serializing user: ', user);
  done(null, user.oid);
});

passport.deserializeUser((oid: string, done) => {
  findByOid(oid, (err, user) => {
    done(err, user);
  });
});

const options: IOIDCStrategyOptionWithRequest = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.CLIENT_ID!,
  redirectUrl: process.env.REDIRECT_URI!,
  clientSecret: process.env.CLIENT_SECRET!,
  responseType: 'code',
  responseMode: 'form_post',
  passReqToCallback: true,
  validateIssuer: true,
  loggingLevel: 'info',
  allowHttpForRedirectUrl: true,
  loggingNoPII: false,
  scope: ['User.Read', 'profile'],
};

const verify: VerifyOIDCFunctionWithReq = (
  _req: Request,
  profile: IProfile,
  done: VerifyCallback,
) => {
  // asynchronous verification, for effect...
  process.nextTick(() => {
    findByOid(profile.oid, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        // "Auto-registration"
        users.push(profile);
        return done(null, profile);
      }
      return done(null, user);
    });
  });
};

const oidcStrategy = new OIDCStrategy(
  options,
  verify,
);

passport.use(oidcStrategy);

export default passport;
