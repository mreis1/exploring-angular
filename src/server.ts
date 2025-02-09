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

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const angularApp = new AngularNodeAppEngine();
const app = express();
app.use(express.json());

const server = new Http.Server(app);

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
//
//const addDevices = async (req: Request, res: Response, next: NextFunction) => {
//  try {
//    const { name, stationName } = req.body;
//    const query = 'INSERT INTO rxjs.device (name, stationName) VALUES (?, ?)';
//    const [result]: any = await db.execute(query, [name, stationName]);
//    const newDevice = { id: result.insertId, name, stationName };
//    io.emit("device-created", newDevice);
//    return res.status(200).json({ message: "Device created successfully", newDevice});
//  } catch (error) {
//    return next(error);
//  }
//}
//
//const addEvents = async (req: Request, res: Response, next: NextFunction) => {
//  try {
//    const { id_tracker, state, errorCode, id_user } = req.body;
//    const query = 'INSERT INTO rxjs.event (id_tracker, state, errorCode, id_user) VALUES (?, ?, ?, ?)';
//    const [result]: any = await db.execute(query, [id_tracker, state, errorCode, id_user]);
//    const newEvent = { id: result.insertId, id_tracker, state, errorCode, id_user };
//    io.emit("event-created", newEvent);
//    return res.status(200).json({ message: "Event created successfully", newEvent});
//  } catch (error) {
//    return next(error);
//  }
//}
//
//const addTracker = async (req: Request, res: Response, next: NextFunction) => {
//  try {
//    const { id_device } = req.body;
//    const query = 'INSERT INTO rxjs.tracker (id_device) VALUES (?)';
//    const [result]: any = await db.execute(query, [id_device]);
//    const newTracker = { id: result.insertId, id_device };
//    io.emit("tracker-created", newTracker);
//    return res.status(200).json({ message: "Tracker created successfully", newTracker});
//  } catch (error) {
//    return next(error)
//  }
//}

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.get('/users', getUsers);
//router.post('/devices', addDevices);
//router.post('/events', addEvents);
//router.post('/tracker', addTracker);

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
  const port = process.env['PORT'] || 4000;

  const io = new IO.Server(server, {
    transports: ['websocket']
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
        callback({ success: true, events });
      } catch (error) {
        callback({ success: false, message: "Error getting events", error});
      }
    })

    socket.on("get-trackers", async (_, callback) => {
      try {
        const query = "SELECT rxjs.tracker.id, rxjs.tracker.id_device, rxjs.device.name, rxjs.device.stationName FROM rxjs.tracker INNER JOIN rxjs.device ON rxjs.tracker.id_device = rxjs.device.id";
        const [trackers] = await db.execute(query);
        callback({ success: true, trackers });
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
        const { id_device, state, errorCode, id_user } = eventData;
        const query = "INSERT INTO rxjs.event (id_device, state, errorCode, id_user) VALUES (?, ?, ?, ?)";
        const [result]: any = await db.execute(query, [id_device, state, errorCode, id_user]);
        const newEvent = { id: result.insertId, id_device, state, errorCode, id_user };
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
        const newTracker = { id: result.insertId, id_device };
        io.emit("tracker-created", newTracker);
        callback({ success: true, tracker: newTracker});
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

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
