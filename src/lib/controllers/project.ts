import { ProjectData } from './../types/model/Project';
import { customeError } from './../utils/errorUtils';
import logger from "../../logger"
import ProjectDB from '../dbCalls/project/project';

const ProjectController = class ProjectController extends ProjectDB {
    static async createProject(data:ProjectData){
        return await ProjectController.__createNewProject(data)
    }

    static async updateProject(data:ProjectData){
        return await ProjectController.__updateProjectData(data)
    }

    static async getProject(data:object){
        return await ProjectController.__getProjectData(data)
    }

    static async deleteProject(id:string){
        return await ProjectController.__deleteProjectData(id)
    }

    static async __deleteProjectData(id:string){
        try {
            let project = await super.deleteProjectDB(id)
            return project
        } catch (error) {
            logger.error({getProjectError:error})
        }
    }

    static async __getProjectData(data:object){
        try {
            let project = await super.getProjectDB(data)
            return project
        } catch (error) {
            logger.error({getProjectError:error})
        }
    }

    static async __updateProjectData(data:ProjectData){
        try {
            let project = await super.updateProjectDB(data)
            return project
        } catch (error) {
            logger.error({updateProjectError:error})
        }
    }

    static async __createNewProject(data:ProjectData){
        try {
            let project = await super.createProjectDB(data)
            return project
        } catch (error) {
            logger.error({getTeamsError:error})
        }
    }


}

export default ProjectController