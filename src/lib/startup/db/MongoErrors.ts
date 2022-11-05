import { MongoServerError } from "mongodb";

const handleMongoError = (error: MongoServerError) => {
  console.log(error);
};
export default handleMongoError;
