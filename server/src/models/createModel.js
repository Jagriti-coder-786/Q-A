import mongoose from 'mongoose';
import { localStore, isMongooseConnected } from '../config/db.js';

export function createModel(name, schemaDefinition, collectionName) {
  let MongooseModel = null;
  try {
    if (mongoose.models[name]) {
      MongooseModel = mongoose.models[name];
    } else {
      const schema = new mongoose.Schema(schemaDefinition, {
        timestamps: true,
        collection: collectionName
      });
      MongooseModel = mongoose.model(name, schema);
    }
  } catch (e) {
    // In case mongoose isn't initialized
  }

  const localCollection = localStore.collection(collectionName);

  return {
    name,
    collectionName,
    schemaDefinition,

    async find(filter = {}) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.find(filter).lean();
      }
      return localCollection.find(filter).exec();
    },

    findChainable(filter = {}) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.find(filter);
      }
      return localCollection.find(filter);
    },

    async findOne(filter = {}) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.findOne(filter).lean();
      }
      return localCollection.findOne(filter);
    },

    async findById(id) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.findById(id).lean();
      }
      return localCollection.findById(id);
    },

    async create(doc) {
      if (isMongooseConnected && MongooseModel) {
        const created = await MongooseModel.create(doc);
        return created.toObject();
      }
      return localCollection.create(doc);
    },

    async insertMany(docs) {
      if (isMongooseConnected && MongooseModel) {
        const created = await MongooseModel.insertMany(docs);
        return created.map(d => d.toObject());
      }
      return localCollection.insertMany(docs);
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.findByIdAndUpdate(id, update, options).lean();
      }
      return localCollection.findByIdAndUpdate(id, update, options);
    },

    async findOneAndUpdate(filter, update, options = { new: true }) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.findOneAndUpdate(filter, update, options).lean();
      }
      return localCollection.findOneAndUpdate(filter, update, options);
    },

    async findByIdAndDelete(id) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.findByIdAndDelete(id).lean();
      }
      return localCollection.findByIdAndDelete(id);
    },

    async deleteMany(filter = {}) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.deleteMany(filter);
      }
      return localCollection.deleteMany(filter);
    },

    async countDocuments(filter = {}) {
      if (isMongooseConnected && MongooseModel) {
        return MongooseModel.countDocuments(filter);
      }
      return localCollection.countDocuments(filter);
    }
  };
}
