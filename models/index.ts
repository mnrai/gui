
import { Sequelize, Model, DataTypes } from "sequelize";
export const sequelize = new Sequelize("db", "", "", {
dialect:"sqlite",
storage: "dbfile"
});

 class User extends Model {
  declare id :number;
  declare username :string;
  declare password :string;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}, {sequelize, timestamps:true});

 class Coldkey extends Model {
   declare id: number;
   declare name: string;
 }
 Coldkey.init(
   {
     id: {
       type: DataTypes.INTEGER,
       autoIncrement: true,
       primaryKey: true,
     },
     name: { type: DataTypes.STRING, allowNull: false, unique: true },
   },
   { sequelize, timestamps: true }
 );

 class Hotkey extends Model {
   declare id: number;
   declare coldkeyId: number;
   declare name: string;
   declare Coldkey: Coldkey;
   declare ColdkeyId: number;
 }
 Hotkey.init(
   {
     id: {
       type: DataTypes.INTEGER,
       autoIncrement: true,
       primaryKey: true,
     },
     name: { type: DataTypes.STRING, allowNull: false, unique: true },
     registered: { type: DataTypes.BOOLEAN, allowNull: false },
   },
   { sequelize, timestamps: true }
 );
 class Miner extends Model {
   declare id: number;
   declare name: string;
   declare model: string;
   declare autocast: boolean;
   declare port: string;
   declare cudaDevice: number;
   declare useCuda: boolean;
   declare subtensorNetwork: string;
   declare subtensorIp: string;
   declare status: number;
   declare Hotkey: Hotkey;
   declare HotkeyId: number;
 }
 Miner.init(
   {
     id: {
       type: DataTypes.INTEGER,
       autoIncrement: true,
       primaryKey: true,
     },
     name: { type: DataTypes.STRING, allowNull: false, unique: true },
     model: { type: DataTypes.STRING, allowNull: false },
     autocast: { type: DataTypes.BOOLEAN, allowNull: false },
     port: { type: DataTypes.STRING, allowNull: false },
     cudaDevice: { type: DataTypes.NUMBER, allowNull: false },
     useCuda: { type: DataTypes.STRING, allowNull: false },
     subtensorNetwork: { type: DataTypes.STRING, allowNull: false },
     subtensorIp: { type: DataTypes.STRING },
     status: { type: DataTypes.NUMBER, allowNull: false },
   },
   { sequelize, timestamps: true }
 );

 Coldkey.hasMany(Hotkey)
 Hotkey.belongsTo(Coldkey)
 Miner.belongsTo(Hotkey);



    User.sync()
Coldkey.sync()
Hotkey.sync()
Miner.sync()

export {
    User,
Coldkey,
Hotkey,
Miner
}