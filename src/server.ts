import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response
 } from 'express';
import path, { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db';
import multer from 'multer';
import * as IO from 'socket.io';
import * as Http from 'node:http';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import cors from 'cors';
import * as fs from 'node:fs';
const fsAsync = fs.promises;

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
server.maxHeadersCount = 500;
server.headersTimeout = 120000;
server.setTimeout(120000);
server.keepAliveTimeout = 120000;
app.use(express.json({ limit: '10mb'}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}))

app.use(cookieSession({
  name: 'session',
  secret: process.env["SESSION_SECRET"] || "supersecret",
  maxAge: 24 * 60 * 60 * 1000,
  secure: false,
  httpOnly: true,
  sameSite: "lax"
}));

const protection = csrf({ cookie: true });

const checkFileName = (filename: string): string => {
  const fixName = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
  const parts = fixName.split(".");
  const extension = parts.pop();
  const fixedName = parts.join(".");
  return `${fixedName}.${extension}`;
}

const uploadDir = path.join(process.cwd(), 'public', 'upload');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = checkFileName(file.originalname);
    cb(null, Date.now() + '_' + filename);
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

app.use('/upload', express.static(uploadDir));

app.post('/api/upload-blob', async (req, res, next) => {
  try {
    const { image2 } = req.body;
    if (!image2 || typeof image2 !== 'string') {
      return res.status(400).json({ message: 'No image provided' });
    }
    const imageBuffer = Buffer.from(image2, 'base64');
    console.log("Image converted to Buffer:", imageBuffer.length, "bytes")
    return res.status(200).json({ image2 });
  } catch (error) {
    return next(error);
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/login' || req.path === '/api/logout') {
    return next();
  }
  protection(req, res, next);
});

app.get("/api/csrf-token", (req: any, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

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
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    return next(error);
  }
};

const checkLogin = async (req: any, res: Response, next: NextFunction) => {
  console.log("Checking session...");
  console.log("req.session:", req.session);
  try {
    if (!req.session.user || !req.session) {
      return res.status(401).json({ message: "Not authenticated"});
    }
    return res.json({ user: req.session.user });
  } catch (error) {
    return next(error);
  }
}

const logout = async (req: any, res: Response, next: NextFunction) => {
  try {
    req.session = null;
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

const register = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('[register][body] ' , req.body);
    const { email, password, name, gender, birthDate, image, image2 } = req.body.user;
    if (!email || !password || !name || !gender || !birthDate) {
      return res.status(400).json({ message: 'This fields are required' });
    }
    const querySelect = 'SELECT id FROM rxjs.users WHERE email = ?';
    const [data]: any = await db.execute(querySelect, [email]);
    if (data.length) {
      return res.status(400).json({ message: 'User already exists' });
    }
    let imageBuffer = null;
    if (image2) {
      imageBuffer = Buffer.from(image2, 'base64');
    }
    const queryInsert =
      'INSERT INTO rxjs.users(email, password, name, gender, birthDate, image, image2) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await db.execute(queryInsert, [email, password, name, gender, birthDate, image || null, imageBuffer]); // returning id

    const query = 'SELECT id, name, email, password, gender, birthDate, (image is not null) as has_image, (image2 is not null) as has_image2 FROM rxjs.users' +
      ' where email = ?';
    const [results]: any = await db.execute(query, [email]);
    const users = results.map((user: any) => ({
      ...user,
      image: user.has_image ? publicLink.image(user.id) : null,
      image2: user.has_image2 ? publicLink.image2(user.id) : null,
    }))
    if (!req.session.user) {
      req.session.user = users[0];
    }
    return res.status(200).json({ message: 'User created successfully', user: users[0] });
  } catch (error) {
    return next(error);
  }
};

//
export const publicLink = {
  image: (id: number) => `/api/users/${id}/image`,
  image2: (id: number) => `/api/users/${id}/image2`,
}

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = 'SELECT id, name, email, password, gender, birthDate, (image is not null) as has_image, (image2 is not null) as has_image2 FROM rxjs.users;';
    const [results]: any = await db.execute(query);
    const users = results.map((user: any) => ({
      ...user,
      image: user.has_image ? publicLink.image(user.id) : null,
      image2: user.has_image2 ? publicLink.image2(user.id) : null,
    }))
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

// fileType <-- https://www.npmjs.com/package/file-type
const getUserImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = 'SELECT image FROM rxjs.users where id = ?';
    const id: number = +req.params['id'];
    const row: {image: string | null } = ((await db.execute(query, [id]))[0] as any)[0];
    if (!row) {
      return next(new Error('User not found'));
    }
    if (!row.image) {
      return next(new Error('User has no image.'));
    }
    console.log(row);

    res.contentType('image/jpg') // @todo remplace with fileType detection

    const imagePath = path.resolve(path.join(uploadDir, row.image!)); // compose image path
    console.log(imagePath)

    const d = await fsAsync.readFile(imagePath!); // read image from file system
    res.status(200).send(d).end();
  } catch (error) {
    next(error);
  }
}


const deleteUsers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    if (req.session.user?.id === userId) {
      return res.status(403).json({ message: "Cannot delete an active user session" });
    }
    const query = 'DELETE FROM rxjs.users WHERE id = ?';
    await db.execute(query, [userId]);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return next(error);
  }
}


const router = express.Router();
router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.get('/check', checkLogin);
router.get('/users', getUsers);
router.get('/users/:id(\\d+)/image', getUserImage);
// router.get('/users/:id(\\d+)/image2', () => {});
router.delete('/user/:id', deleteUsers);

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
        const query = "SELECT rxjs.tracker.id, rxjs.tracker.id_device, rxjs.tracker.last_activity, rxjs.device.name, rxjs.device.stationName FROM rxjs.tracker INNER JOIN rxjs.device ON rxjs.tracker.id_device = rxjs.device.id";
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
        let { id_device, state, error_code, id_user, created_at } = eventData;
        error_code = error_code ?? null;
        created_at = created_at ?? null;
        const query = "INSERT INTO rxjs.event (id_device, state, error_code, id_user, created_at) VALUES (?, ?, ?, ?, NOW())";
        const [result]: any = await db.execute(query, [id_device, state, error_code, id_user]);
        const querySelect = "SELECT * FROM rxjs.event WHERE id = ?";
        const [newEvent]: any = await db.execute(querySelect, [result.insertId]);
        const queryUpdate = "UPDATE rxjs.tracker SET last_activity = NOW() WHERE id_device = ?"
        await db.execute(queryUpdate, [id_device]);
        io.emit("event-created", newEvent);
        callback({ success: true, event: newEvent[0]});
      } catch (error) {
        callback({ success: false, message: "Error creating event", error});
      }
    })

    socket.on("create-tracker", async (trackerData, callback) => {
      try {
        const { id_device } = trackerData;
        console.log('id_device', id_device)
        const query = "INSERT INTO rxjs.tracker (id_device) VALUES (?)";
        const [result]: any = await db.execute(query, [id_device]);
        const querySelect = "SELECT rxjs.tracker.id, rxjs.tracker.id_device, rxjs.device.name, rxjs.device.stationName FROM rxjs.tracker INNER JOIN rxjs.device ON rxjs.tracker.id_device = rxjs.device.id WHERE rxjs.tracker.id = ?"
        const [trackerDetails] = await db.execute(querySelect, [result.insertId]);
        // const trackerDetails = await db.execute(querySelect, [result.insertId]);
        io.emit("tracker-created", (trackerDetails as any)[0] ?? null);
        // io.emit("tracker-created", (trackerDetails as any)[0][0] ?? null);
        callback({ success: true, tracker: trackerDetails});
      } catch (error) {
        callback({ success: false, message: "Error creating tracker", error});
      }
    })

    socket.on("delete-tracker", async (trackData, callback) => {
      try {
        const { id } = trackData;
        console.log('id', id);
        const query = "DELETE FROM rxjs.tracker WHERE id = ?";
        const [result]: any = await db.execute(query, [id]);
        if (result.affectedRows === 0) {
          return callback({ success: false, message: "Tracker not found" });
        }
        io.emit("tracker-deleted", id);
        callback({ success: true });
      } catch (error) {
        callback({ success: false, message: "Error deleting tracker", error});
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
