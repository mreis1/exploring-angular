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
import multer from 'multer';
import * as IO from 'socket.io';
import * as Http from 'node:http';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import jwt from 'jsonwebtoken';

console.log('---------#2')
console.log("🔹 Loaded Database Config:");
console.log("DB_USER:", process.env["DB_USER"]);
console.log("DB_PASSWORD:", process.env["DB_PASSWORD"] ? "******" : "NOT SET");
console.log("DB_NAME:", process.env["DB_DATABASE"]);
console.log("DB_HOST:", process.env["DB_HOST"]);
console.log("DB_PORT:", process.env["DB_PORT"]);

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const angularApp = new AngularNodeAppEngine();
const app = express();
const server = new Http.Server(app);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env["SESSION_SECRET"] || "supersecret",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, sameSite: "lax" }
}));

const protection = csrf({ cookie: true });

const uploadDir: string = "../public/upload";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname);
  },
})

const upload = multer({ storage })

app.post('/api/upload', upload.single("file"), function (req, res) {
  const file = req.file;
  if (!file) {
    console.error("File upload failed: No file received");
    return res.status(400).json({ message: "File upload failed" });
  }
  console.log("File uploaded successfully:", file.filename);
  return res.status(200).json({ filename: file?.filename});
})

const login = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body.user;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const query = 'SELECT * FROM rxjs.users WHERE email = ?';
    const [results]: any = await db.execute(query, [email]);
    const user = results[0];
    if (!results.length || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log("User authenticated:", user);
    req.session.user = user;
    console.log("Session after login:", req.session);
    const token = jwt.sign({ id: user.id }, process.env["JWT_SECRET"] || 'secret', { expiresIn: '1h'});
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return next(error);
  }
};

app.use(protection);
app.get("/api/csrf-token", (req: any, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const checkLogin = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated"});
    }
    return res.json({ user: req.session.user });
  } catch (error) {
    return next(error);
  }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("auth_token");
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged successful" });
    })
  } catch (error) {
    next(error);
  }
}

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const { email, password, name, gender, birthDate, image } = req.body.user;
    if (!email || !password || !name || !gender || !birthDate) {
      return res.status(400).json({ message: 'This fields are required' });
    }
    const querySelect = 'SELECT * FROM rxjs.users WHERE email = ?';
    const [data]: any = await db.execute(querySelect, [email]);
    if (data.length) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const queryInsert =
      'INSERT INTO rxjs.users(email, password, name, gender, birthDate, image) VALUES (?, ?, ?, ?, ?, ?)';
    await db.execute(queryInsert, [email, password, name, gender, birthDate, image || null]);
    const [newUser]: any = await db.execute(querySelect, [email]);
    //io.emit("user-created", newUser[0]);
    return res.status(200).json({ message: 'User created successfully', user: newUser[0] });
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = 'SELECT * FROM rxjs.users';
    const [results]: any = await db.execute(query);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
}


const router = express.Router();
router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.get('/check', checkLogin);
router.get('/users', getUsers);

app.use('/api', router);

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;

  const io = new IO.Server(server, {
    transports: ['websocket'],
    cors: {
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("connected", socket.id);

    socket.on("get-devices", async (_, callback) => {
      try {
        const query = "SELECT * FROM rxjs.device";
        const [devices] = await db.execute(query);
        callback({ success: true, devices });
      } catch (error) {
        callback({ success: false, message: "Error getting devices", error});
      }
    })

    socket.on("get-events", async (_, callback) => {
      try {
        const query = "SELECT * FROM rxjs.event";
        const [events] = await db.execute(query);
        console.log(events);
        callback({ success: true, events });
        console.log(events);
      } catch (error) {
        callback({ success: false, message: "Error getting events", error});
      }
    })

    socket.on("get-trackers", async (_, callback) => {
      try {
        const query = "SELECT rxjs.tracker.id, rxjs.tracker.id_device, rxjs.device.name, rxjs.device.stationName FROM rxjs.tracker INNER JOIN rxjs.device ON rxjs.tracker.id_device = rxjs.device.id";
        const [trackers] = await db.execute(query);
        console.log(trackers);
        callback({ success: true, trackers });
        console.log(trackers);
      } catch (error) {
        callback({ success: false, message: "Error getting trackers", error})
      }
    })

    socket.on("create-device", async (deviceData, callback) => {
      try {
        const { name, stationName } = deviceData;
        const query = "INSERT INTO rxjs.device (name, stationName) VALUES (?, ?)";
        const [result]: any = await db.execute(query, [name, stationName]);
        const newDevice = { id: result.insertId, name, stationName };
        io.emit("device-created", newDevice);
        callback({ success: true, device: newDevice});
      } catch (error) {
        callback({ success: false, message: "Error creating device", error});
      }
    })

    socket.on("create-event", async (eventData, callback) => {
      try {
        let { id_device, state, error_code, id_user } = eventData;
        error_code = error_code ?? null;
        const query = "INSERT INTO rxjs.event (id_device, state, error_code, id_user) VALUES (?, ?, ?, ?)";
        const [result]: any = await db.execute(query, [id_device, state, error_code, id_user]);
        const newEvent = { id: result.insertId, id_device, state, error_code, id_user };
        io.emit("event-created", newEvent);
        callback({ success: true, event: newEvent});
      } catch (error) {
        callback({ success: false, message: "Error creating event", error});
      }
    })

    socket.on("create-tracker", async (trackerData, callback) => {
      try {
        const { id_device } = trackerData;
        const query = "INSERT INTO rxjs.tracker (id_device) VALUES (?)";
        const [result]: any = await db.execute(query, [id_device]);
        const querySelect = "SELECT rxjs.tracker.id, rxjs.tracker.id_device, rxjs.device.name, rxjs.device.stationName FROM rxjs.tracker INNER JOIN rxjs.device ON rxjs.tracker.id_device = rxjs.device.id WHERE rxjs.tracker.id = ?"
        const [trackerDetails] = await db.execute(querySelect, [result.insertId]);
        io.emit("tracker-created", trackerDetails);
        callback({ success: true, tracker: trackerDetails});
      } catch (error) {
        callback({ success: false, message: "Error creating tracker", error});
      }
    })

    socket.on("disconnect", () => {
      console.log("disconnected", socket.id);
    })
  })

  let onError = (error: any) => {
    const bind = 'Port ' + port;
    let msg;
    switch (error.code) {
      case 'EACCES':
        msg = bind + ' requires elevated privileges';
        break;
      case 'EADDRINUSE':
        msg = bind + ' is already in use';
        break;
      default:
        msg = 'Server could not be started. Err: ' + error.message;
    }
    console.log(msg);
    process.exit();
  };

  server.on('error', onError);
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
