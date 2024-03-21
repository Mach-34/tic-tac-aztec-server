import { Collection, Db, MongoClient } from "mongodb";

export default class DBClient {

    private client: MongoClient;
    private database: Db | null;
    private name: string;
    private tables: { [name: string]: Collection }

    constructor(url: string, name: string) {
        this.client = new MongoClient(url);
        this.database = null;
        this.name = name;
        this.tables = {};
    }

    async init() {
        try {
            await this.client.connect();
            this.database = this.client.db(this.name);
            console.log(`🔥 Connected to ${this.name} 🔥`);
        } catch (err) {
            console.log('Err connecting to mongo')
        }
    }
    getClient = () => this.client
    getDatabase = () => this.database
    getTable = (tableName: string) => {
        if (this.tables[tableName] === undefined && this.database) {
            this.tables[tableName] = this.database.collection(tableName);
        }
        return this.tables[tableName];
    };
}