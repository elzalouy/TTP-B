import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoDB from './db/dbConnect';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

import i18n from './i18n/config';
const ngrok = require('ngrok');

//Routes
import userRoutes from './routes/user/userRoute';
import boardRoutes from './routes/board/boardRoute';
import techMemberRoute from './routes/techMember/techMemberRoute';
import authRoute from './routes/auth/authRoute';
import depRoute from './routes/department/depRoute';
import projectRoute from './routes/project/projectRoute';
import taskRoute from './routes/task/taskRoute';
import categoryRoute from './routes/category/categoryRoute';
import clientRoute from './routes/client/clientRoute';

import { jwtVerify } from './services/auth/auth';
import { customeError } from './utils/errorUtils';
import { JwtPayload } from 'jsonwebtoken';
import UserDB from './dbCalls/user/user';
import logger from '../logger';

const app: Application = express();
export const http = createServer(app);
export const io = new Server(http, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

app.use(cookieParser());

// middlewares
app.use(morgan('dev'));

// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// MongoDB init
mongoDB();

// i18n init
app.use(i18n.init);

// app.get('/api/creatUser',(req,res) => {
//   // let definedUrl = trelloApi('webhooks')
//   // i18n.setLocale('en')
// // "idBoard": "616577753fa7db4ef1e715ea",
//   // logger.info(trelloApi('card'))
//   res.send(i18n.__('key'))
// })

// Ngrok init
if (process.env.NODE_ENV === 'development') {
  ngrok.connect(
    {
      proto: 'http',
      addr: process.env.PORT,
    },
    (err: any) => {
      if (err) {
        console.error('Error while connecting Ngrok', err);
        return new Error('Ngrok Failed');
      }
    }
  );
}

// auth route
app.use('/api', authRoute);

// task route
app.use('/api', taskRoute);

// Authenticate User
// app.use(async (req:Request,res:Response,next:NextFunction) => {
//   let checkToken:string | JwtPayload = await jwtVerify(req.cookies.token)
//   if(checkToken.user){
//     const{user}=checkToken
//     let findUser = await UserDB.findUserById(user.id)
//     if(findUser){
//       next()
//     } else {
//       return res.status(401).send(customeError('user_not_exsit',401))
//     }
//   }else {
//     return res.status(401).send(customeError('user_not_exsit',401))
//   }
// })

//routes
app.use('/api', userRoutes);
app.use('/api', boardRoutes);
app.use('/api', techMemberRoute);
app.use('/api', depRoute);
app.use('/api', projectRoute);
app.use('/api', categoryRoute);
app.use('/api', clientRoute);

app.disable('etag');

// connect to socket io
io.on('connection', (socket: any) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});
