import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response
 } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { db } from './db';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body.user;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const query = 'SELECT * FROM rxjs.users WHERE email = ?';
    const [results]: any = await db.execute(query, [email]);
    if (!results.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = results[0];
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return next(error);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, gender, birthDate } = req.body.user;
    if (!email || !password || !name || !gender || !birthDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const querySelect = 'SELECT * FROM rxjs.users WHERE email = ?';
    const [data]: any = await db.execute(querySelect, [email]);
    if (data.length) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const queryInsert =
      'INSERT INTO rxjs.users(email, password, name, gender, birthDate) VALUES (?, ?, ?, ?, ?)';
    await db.execute(queryInsert, [email, password, name, gender, birthDate]);
    const [newUser]: any = await db.execute(querySelect, [email]);
    return res.status(200).json({ message: 'User created successfully', user: newUser[0] });
  } catch (error) {
    return next(error);
  }
};

const router = express.Router();
router.post('/login', login);
router.post('/register', register);

app.use('/api', router);

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
