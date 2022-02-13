import { Board ,BoardData} from '../../types/model/Board';
import logger from '../../../logger'
import Boards from '../../models/Board';

const BoardDB = class BoardDB {
    static async getBoards (data:BoardData) {
        return await this.__getBoards(data)
    }

    static async createBoard(data:BoardData){
        return await this.__addBoard(data)
    }

    static async __getBoards(data:BoardData) {
        try {
            let board:Board = await Boards.findOne(data)
            return board
        } catch (error) {
            logger.error({getBoardsError:error})
        }
    }

    static async __addBoard(data:BoardData){
        try {
            let board = new Boards(data)
            await board.save()
            return board
        } catch (error) {
            logger.error({createBoardError:error})
        }
    }
}