import mysql from 'mysql2/promise';
import { config } from './api';

let client: mysql.Connection | null = null;

export async function getMysqlClient() {
  if (!client) {
    client = await mysql.createConnection({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
    });
  }
  return client;
}
