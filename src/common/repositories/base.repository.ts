import { BaseDTO } from '@DTO/base.dto';
import Constants from '@Helper/constants';
import { FilterQuery, Model, Document } from 'mongoose';
export class BaseRepository<T extends Document> {
  constructor(private readonly repository: Model<T>) {}

  /**
   *
   * @returns Collection of model specified by caller
   */

  public async getAll(): Promise<T[]> {
    const result = await this.repository.find().exec();
    return result;
  }

  /**
   * @params fieldNames specify column names separated by spaces
   * @returns Collection of model specified by caller
   */

  public async getAllBySpecifiedColumns(fieldNames: any): Promise<T[]> {
    const result = await this.repository
      .aggregate([{ $project: fieldNames }])
      .exec();
    return result;
  }

  /**
   *
   * @param id unique identifier for the item specified in particular collection
   * @returns single element in the collection
   */
  public async get(id: string): Promise<T> {
    const result = await this.repository.findById(id).exec();
    return result;
  }

  /**
   *
   * @param filter query for searching any item in the document
   * @returns collection of specified type returned by the query
   */
  public async getByFilter(
    filter: FilterQuery<T>,
    columnToSelect?: any,
  ): Promise<T[]> {
    const result = await this.repository.find(filter, columnToSelect).exec();
    return result;
  }

  /**
   * @returns first item of specified type in the document
   */
  public async getFistOne(): Promise<T> {
    const result = await this.repository.findOne().exec();
    return result;
  }

  /**
   *
   * @param filter query for searching one item in the document
   * @returns only one item of specified type returned by the query
   */
  public async getOneByFilter(filter: FilterQuery<T>): Promise<T> {
    const result = await this.repository.findOne(filter).exec();
    return result;
  }

  /**
   *
   * @param filter query to perform aggregation in the collection
   * @returns specialized result set after performing aggregation
   */
  public async getAggregation<T>(filter: any): Promise<T[]> {
    const result = await await this.repository.aggregate<T>(filter).exec();
    return result;
  }

  /**
   *
   * @param item single item to be created in mongoDB for particular document
   * @returns newly created item
   */
  public async create(item: T): Promise<BaseDTO> {
    const result = await this.repository.create(item);
    let baseDTO = new BaseDTO();
    baseDTO.id = result._id.toString();
    return baseDTO;
  }

  /**
   *
   * @param items multiple items to be created in mongoDB for particular document
   * @returns newly created item
   */
  public async createMultiple(items: T[]): Promise<BaseDTO[]> {
    try {
      const result = await this.repository.insertMany(items);
      let baseDTOs: BaseDTO[] = [];
      if (result && result.length) {
        let baseDTO: BaseDTO = null;
        for (let r of result) {
          baseDTO = new BaseDTO();
          baseDTO.id = r._id;
          baseDTOs.push(baseDTO);
        }
        return baseDTOs;
      } else throw new Error(Constants.GENERIC_ERROR_INSERT_MESSAGE);
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   *
   * @param id item's id which has to be modified.
   * @param item the item is to be modified in the particular document
   * @returns newly modified item's id
   */
  public async update(id: string, item: T): Promise<any> {
    const result = await this.repository.findByIdAndUpdate(id, {
      $set: item,
    } as any);
    return result._id;
  }

  /**
   *
   * @param id item's id which has to be modified.
   * @param item the particular attribute(s) is to be modified in the particular document
   * @returns newly modified item's id
   */
  public async updateProperty(id: string, item: any): Promise<string> {
    const result = await this.repository.findByIdAndUpdate(id, {
      $set: item,
    } as any);
    return result._id.toString();
  }

  /**
   * @param filter finds by the specific attribute
   * @param item the item is to be modified in the particular document
   * @returns newly modified item's id
   */
  public async findByFilterAndModify(
    filter: FilterQuery<T>,
    item: T,
  ): Promise<any> {
    const result = await this.repository.find(filter).updateOne({
      $set: item,
      upsert: true,
    } as any);
    return result;
  }

  /**
   *
   * @param filter finds by the specific attribute
   * @param item the item is to be modified in the particular document
   * @returns newly modified item's id
   */
  public async findAndReplaceOne(
    filter: FilterQuery<T>,
    item: T,
  ): Promise<any> {
    const result = await this.repository.find(filter).replaceOne({
      $set: item,
      upsert: true,
    } as any);
    return result;
  }

  /**
   *
   * @param filter finds by the specific attribute
   * @param item the item is to be modified in the particular document
   * @returns newly modified item's id
   */
  public async findByFilterAndDeleteInArray(
    filter: FilterQuery<T>,
    item: T,
  ): Promise<any> {
    const result = await this.repository.find(filter).updateMany({
      $pullAll: item,
    } as any);
    return result;
  }

  /**
   *
   * @param filter query for searching one item in the document. specify {} to replace on first document. and upsert if not found.
   * @returns true/false basend on the operation success
   */
  public async replaceOne(
    filter: FilterQuery<T>,
    replacememnt: T,
  ): Promise<any> {
    const result = await this.repository.replaceOne(filter, replacememnt, {
      upsert: true,
    });
    return result;
  }

  /**
   * @param filter the criteria on which records will be deleted.
   */
  public async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.repository.deleteMany(filter);
    return result.deletedCount;
  }

  /**
   * @param items create new item / update existing ones
   * @param filter it will be used to check if exists then update else insert new record using mongo's upsert logic
   * @returns baseDTOs will contain the upserted Id
   */
  public async insertIfNotExistsElseUpdate(
    items: T[],
    filter: FilterQuery<T>[],
  ): Promise<BaseDTO[]> {
    try {
      let baseDTOs: BaseDTO[] = [];
      let bulkRecords = [];
      let counter = 0;
      for (let item of items) {
        bulkRecords.push({
          updateOne: {
            filter: filter[counter],
            update: { $setOnInsert: item },
            upsert: true,
          },
        });
        counter++;
      }
      const result = await this.repository.bulkWrite(bulkRecords, {
        ordered: false,
      });
      if (result.upsertedCount > 0 || result.insertedCount > 0) {
        const response = result.getUpsertedIds() || result.getInsertedIds();
        for (let ids of response) {
          baseDTOs.push({
            id: ids._id,
          });
        }
      }
      return baseDTOs;
    } catch (e) {
      console.log(e);
    }
  }
}
