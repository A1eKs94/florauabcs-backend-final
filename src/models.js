const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

/**
 * Enlace a la base de datos
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const sequelize = new Sequelize(process.env.MYSQLDATABASE, process.env.MYSQLUSER, process.env.MYSQLPASSWORD, {
  host: process.env.MYSQLHOST,
  dialect: 'mysql',
});

/**
 * Definicion de la tabla planta
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const Plantas = sequelize.define('Plantas', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_cientifico: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  nombre_comun: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  familia: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  forma_biologica: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tipo_vegetacion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  vulnerada: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  informacion_adicional: {
    type: DataTypes.STRING(300),
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'plantas'
});

/**
 * Definicion de la tabla observacion
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const Observaciones = sequelize.define('Observaciones', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  localidad: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  latitud: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  longitud: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  fisiografia: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  fecha_colecta: {
    type: DataTypes.DATE,
    allowNull: false
  },
  colector: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  identificador: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  id_plantas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Plantas,
      key: 'id'
    }
  },
  imagenes: {
    type: DataTypes.JSON
  }
}, {
  timestamps: false,
  tableName: 'observaciones'
});

/**
 * Definicion de la tabla log
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tipoEvento: {
    type: DataTypes.ENUM('INSERCION', 'EDICION', 'CONSULTA', 'ELIMINACION'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(60),
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'log'
});

/**
 * Definicion de la tabla cuenta
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const Cuentas = sequelize.define('Cuentas', {
  correo: {
    type: DataTypes.STRING(80),
    allowNull: false,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING(100)
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: false,
  tableName: 'cuentas'
});

/**
 * Definicion de la tabla aprobacion
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const Aprobaciones = sequelize.define('Aprobaciones', {
  correo_cuenta: {
    type: DataTypes.STRING(128),
    allowNull: false,
    primaryKey: true,
    references: {
      model: Cuentas,
      key: 'correo'
    }
  },
  observaciones_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Observaciones,
      key: 'id'
    }
  }
}, {
  timestamps: false,
  tableName: 'aprobaciones'
});

// Definir relaciones
Plantas.hasMany(Observaciones, { foreignKey: 'id_plantas' });
Observaciones.belongsTo(Plantas, { foreignKey: 'id_plantas' });
Aprobaciones.belongsTo(Cuentas, { foreignKey: 'correo_cuenta' });
Aprobaciones.belongsTo(Observaciones, { foreignKey: 'observaciones_id' });

/**
 * Sincronizacion con la base de datos
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description Sincroniza las tablas creadas anteriormente a la base de datos
 */
sequelize.sync({ force: false }).then(() => {
  console.log('Tablas creadas!');
}).catch(error => {
  console.error('Error creando las tablas: ', error);
});

module.exports = {
  Plantas,
  Observaciones,
  Cuentas
}