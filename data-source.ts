import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/config/ormconfig';

export default new DataSource(typeOrmConfig);
