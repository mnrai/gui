
const { Sequelize, Model, DataTypes } = require("sequelize");
 const sequelize = new Sequelize("db", "", "", {
dialect:"sqlite",
storage: "dbfile",
logging: false
});

 class User extends Model {
  // declare id :number;
  // declare username :string;
  // declare password :string;
}



 class Coldkey extends Model {
  //  declare id: number;
  //  declare name: string;
 }


 class Hotkey extends Model {
  //  declare id: number;
  //  declare coldkeyId: number;
  //  declare name: string;
  //  declare Coldkey: Coldkey;
  //  declare ColdkeyId: number;
 }

 class Miner extends Model {
  //  declare id: number;
  //  declare name: string;
  //  declare model: string;
  //  declare autocast: boolean;
  //  declare port: string;
  //  declare cudaDevice: number;
  //  declare useCuda: boolean;
  //  declare subtensorNetwork: string;
  //  declare subtensorIp: string;
  //  declare status: number;
  //  declare Hotkeys: Hotkey[];
 }


 class Stat extends Model {
  //  declare id: number;
  //  declare name: string;
  //  declare model: string;
  //  declare autocast: boolean;
  //  declare port: string;
  //  declare cudaDevice: number;
  //  declare useCuda: boolean;
  //  declare subtensorNetwork: string;
  //  declare subtensorIp: string;
  //  declare status: number;
  //  declare Hotkeys: Hotkey[];
 }
  Coldkey.hasMany(Hotkey);
  Hotkey.belongsTo(Coldkey);
  Stat.belongsTo(Coldkey);
  Miner.hasMany(Hotkey);


const init = async () => {

 

await User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}, {sequelize, timestamps:true});
 await Coldkey.init(
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
 await Hotkey.init(
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
 await Miner.init(
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
 await Stat.init(
   {
     id: {
       type: DataTypes.INTEGER,
       autoIncrement: true,
       primaryKey: true,
     },
     amount: { type: DataTypes.DOUBLE, allowNull: false },
     trust: { type: DataTypes.DOUBLE, allowNull: false },
   },
   { sequelize, timestamps: true }
 );


    await User.sync()
    await Coldkey.sync()
    await Hotkey.sync()
    await Miner.sync()
    await Stat.sync()

    return true
}

module.exports = {
  init,
  sequelize,
  User,
  Coldkey,
  Hotkey,
  Miner,
  Stat
};