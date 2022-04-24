import cron from 'node-cron'
import logger from '../../../logger';


// '0 0 0 1-31 0-7'

export default cron.schedule('* * * * * *', () => {
    logger.info('running every minute 1, 2, 4 and 5');
  });