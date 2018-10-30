const Sequelize = require("sequelize");
const DT = Sequelize.DataTypes;

module.exports = {
  vendor: {
    name: {
      type: DT.STRING(50),
      allowNull: false,
      unique: true
    }
  },

  product: {
    name: {
      type: DT.STRING(100),
      allowNull: false
    },
    price: {
      type: DT.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DT.INTEGER,
      defaultValue: 0
    }
  },

  user: {
    username: {
      type: DT.STRING(100),
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"]
    },
    email: {
      type: DT.STRING(100),
      isEmail: true,
      unique: true,
      required: [true, "can't be blank"],
      defaultValue: ""
    },
    password: {
      type: DT.STRING(100)
    },
    token: {
      type: DT.STRING(300),
      unique: true
    },
    bio: {
      type: DT.STRING(100),
      defaultValue: null
    },
    image: {
      type: DT.STRING(100),
      defaultValue: null
    }
  }
};
