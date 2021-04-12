/**
 * Entry point to the project config.
 */

import * as dotenv from 'dotenv';


dotenv.config({ path: __dirname + '/.env' });
 
 
export default Object.assign(process.env, { sourceDir: __dirname });