import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory & Disk-persisted storage store fallback for zero-dependency execution
class LocalStore {
  constructor() {
    this.filePath = path.join(DATA_DIR, 'db_store.json');
    this.data = {
      users: [],
      spaces: [],
      documents: [],
      chunks: [],
      conversations: [],
      messages: [],
      notes: [],
      highlights: [],
      activityLogs: [],
      subscriptions: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('⚠️ [LocalStore] Failed to read store file, starting fresh:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ [LocalStore] Failed to persist data:', err.message);
    }
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    const list = this.data[name];
    const self = this;

    return {
      find(filter = {}) {
        return {
          async exec() {
            return list.filter(item => {
              for (const [k, v] of Object.entries(filter)) {
                if (v && typeof v === 'object' && '$in' in v) {
                  if (!v.$in.includes(item[k])) return false;
                } else if (item[k] !== v) {
                  return false;
                }
              }
              return true;
            });
          },
          sort(sortCriteria = {}) {
            return {
              async exec() {
                const results = await list.filter(item => {
                  for (const [k, v] of Object.entries(filter)) {
                    if (item[k] !== v) return false;
                  }
                  return true;
                });
                const [sortKey, sortDir] = Object.entries(sortCriteria)[0] || ['createdAt', -1];
                return results.sort((a, b) => {
                  if (a[sortKey] < b[sortKey]) return sortDir === -1 ? 1 : -1;
                  if (a[sortKey] > b[sortKey]) return sortDir === -1 ? -1 : 1;
                  return 0;
                });
              }
            };
          }
        };
      },

      async findOne(filter = {}) {
        return list.find(item => {
          for (const [k, v] of Object.entries(filter)) {
            if (v && typeof v === 'object' && '$in' in v) {
              if (!v.$in.includes(item[k])) return false;
            } else if (item[k] !== v) {
              return false;
            }
          }
          return true;
        }) || null;
      },

      async findById(id) {
        return list.find(item => item._id === id || item.id === id) || null;
      },

      async create(doc) {
        const _id = doc._id || doc.id || ('id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
        const now = new Date().toISOString();
        const record = { ...doc, _id, id: _id, createdAt: doc.createdAt || now, updatedAt: now };
        list.push(record);
        self.save();
        return record;
      },

      async insertMany(docs) {
        const created = [];
        for (const doc of docs) {
          const _id = doc._id || doc.id || ('id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
          const now = new Date().toISOString();
          const record = { ...doc, _id, id: _id, createdAt: doc.createdAt || now, updatedAt: now };
          list.push(record);
          created.push(record);
        }
        self.save();
        return created;
      },

      async findByIdAndUpdate(id, update, options = { new: true }) {
        const idx = list.findIndex(item => item._id === id || item.id === id);
        if (idx === -1) return null;
        const current = list[idx];
        const updated = {
          ...current,
          ...(update.$set ? update.$set : update),
          updatedAt: new Date().toISOString()
        };
        list[idx] = updated;
        self.save();
        return updated;
      },

      async findOneAndUpdate(filter, update, options = { new: true }) {
        const item = await this.findOne(filter);
        if (!item) return null;
        return this.findByIdAndUpdate(item._id, update, options);
      },

      async findByIdAndDelete(id) {
        const idx = list.findIndex(item => item._id === id || item.id === id);
        if (idx === -1) return null;
        const [removed] = list.splice(idx, 1);
        self.save();
        return removed;
      },

      async deleteMany(filter = {}) {
        const initialLen = list.length;
        this.data[name] = list.filter(item => {
          for (const [k, v] of Object.entries(filter)) {
            if (item[k] === v) return false;
          }
          return true;
        });
        self.data[name] = this.data[name];
        self.save();
        return { deletedCount: initialLen - this.data[name].length };
      },

      async countDocuments(filter = {}) {
        if (!Object.keys(filter).length) return list.length;
        const res = await this.find(filter).exec();
        return res.length;
      }
    };
  }
}

export const localStore = new LocalStore();
export let isMongooseConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('📦 [Database] MONGODB_URI not set. Using built-in persistent embedded JSON engine.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    isMongooseConnected = true;
    console.log('✅ [Database] Connected to MongoDB database successfully.');
  } catch (err) {
    console.warn('⚠️ [Database] Could not connect to MongoDB server (' + err.message + '). Falling back to built-in persistent embedded engine.');
    isMongooseConnected = false;
  }
}
