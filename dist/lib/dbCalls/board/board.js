"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../logger"));
const Board_1 = __importDefault(require("../../models/Board"));
const BoardDB = class BoardDB {
  static getBoards(data) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.__getBoards(data);
    });
  }
  static createBoard(data) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.__addBoard(data);
    });
  }
  static __getBoards(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let board = yield Board_1.default.findOne(data);
        return board;
      } catch (error) {
        logger_1.default.error({ getBoardsError: error });
      }
    });
  }
  static __addBoard(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let board = new Board_1.default(data);
        yield board.save();
        return board;
      } catch (error) {
        logger_1.default.error({ createBoardError: error });
      }
    });
  }
};
