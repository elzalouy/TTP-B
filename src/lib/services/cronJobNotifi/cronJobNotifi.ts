import moment from 'moment'
import cron from 'node-cron'
import logger from '../../../logger';
import NotificationController from '../../controllers/notification';
import ProjectDB from '../../dbCalls/project/project';
import { io } from '../../server';


// '0 0 0 1-31 0-7'
//todo update notification cron job
export default cron.schedule('* * * * * *', async () => {
    //todo check if project is passed the deadline
    let projects = await ProjectDB.getProjectDB({projectStatus:{$in:["inProgress","late"]},projectDeadline:{$gt:new Date()}})
    if(projects.length > 1){
        for(let i=0; i< projects.length;i++){
          let createNotifi = await NotificationController.createNotification({
            title:`${projects[i].name} Overdue`,
            projectManagerID:projects[i].projectManager,
            description:`${projects[i].name} project Due date ${moment(projects[i].projectDeadline).format('dd/mm/yyyy')}`,
            clientName:projects[i].clientId
          })

          // send notification to all admin
          io.to("admin room").emit('notification update',createNotifi)

          // send notification to specific project manager
          io.to(`user-${projects[i].projectManager}`).emit("notification update", createNotifi)
        }
    }

    //todo check if the task pass the deadline
    // let tasks = 

  });