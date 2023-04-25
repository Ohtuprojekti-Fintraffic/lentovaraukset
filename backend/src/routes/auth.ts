import express from 'express';
import passport from '../auth/passport';

const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) next();
  res.sendStatus(401);
};

const router = express.Router();

router.get('/login', (req, res, next) => {
  passport.authenticate(
    'azuread-openidconnect',
    // 'oauth-bearer',
    {
      failureRedirect: '/',
    },
  )(req, res, next);
});

router.post(
  '/callback',
  (req, res, next) => {
    passport.authenticate(
      'azuread-openidconnect',
      {
        failureRedirect: '/',
      },
    )(req, res, next);
  },
  (_req, res) => {
    res.redirect('/');
  },
);

// 'logout' route, logout from passport, and destroy the session with AAD.
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    req.logOut({}, () => {});
    res.redirect('/');
  });
});

router.get(
  '/user',
  ensureAuthenticated,
  (req, res) => {
    res.json(req.user);
  },
);

export default router;
