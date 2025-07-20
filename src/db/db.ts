import { Database } from 'bun:sqlite';
import { join } from 'path';

const dbPath = join(',', 'db.sqlite');

let db: Database;

export const dbConn = () => {
	if (!db) {
		db = new Database(dbPath);
		db.exec('PRAGMA journal_mode = WAL');
	}
	return db;
};
