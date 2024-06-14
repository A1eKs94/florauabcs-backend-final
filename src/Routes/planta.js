const express = require('express');
const router = express.Router();
const authRoute = require('../middleware.js');
const { Plantas, Observaciones } = require('../models.js')
const { Op } = require('sequelize');

/**
 * Ruta: Registrar planta
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description peticion POST para registrar una planta, esta queda guardada en la base de datos
 */
router.post('/', authRoute, async (req, res) => {
    const body = req.body;

    if(Object.keys(body).length === 0) {
        res.status(400).json({status:"failed",message:"La petición no contiene información en el body"});
    }

    await Plantas.create(body).then(data => {
        res.status(200).json({status:"ok",message:"Planta cargada a la base de datos"});
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err})
    })
});

/**
 * Ruta: Obtener planta por nombre
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description peticion GET para obtener una planta a partir del nombre científico o nombre común. se puede limitar la informacion mediante
 * el query 'offset' para indicar desde que elemento empieza a buscar y 'limit' para indicar el limite de respuestas. Esta
 * ruta responde con la informacion de la planta que coincida con la busqueda.
 */
router.get('/:planta', async (req, res) => {
    const planta = req.params.planta;

    if(req.query.limit || req.query.offset) {
        const limit = parseInt(req.query.limit,10);
        const offset = parseInt(req.query.offset,10); 
        await Plantas.findAll({
            where: {
            [Op.or]: [
                { nombre_cientifico: { [Op.like]: `%${planta}%` } },
                { nombre_comun: { [Op.like]: `%${planta}%` } }
            ]
            },
            limit: limit,
            offset: offset
        }).then(data => {
            console.log("AAAAAAAAAAAAAAABDBYWUSAIHDEYUSAHD:",data)
            res.status(200).json({status:"ok",message:data,relations:"TEST"});
        }).catch(err => {
            res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
        })
    } else {
        
        try {
            const plantas = await Plantas.findAll({
                where: {
                [Op.or]: [
                    { nombre_cientifico: { [Op.like]: `%${planta}%` } },
                    { nombre_comun: { [Op.like]: `%${planta}%` } }
                ]
                }
            });

            try {
                console.log("AAAAAAAAAAAAAAABDBYWUSAIHDEYUSAHD:",plantas[0].dataValues.id)
                const observacion = await Observaciones.findAll({
                    where: {
                        id_plantas: plantas[0].dataValues.id
                    }
                })
                res.status(200).json({status:"ok",message:plantas,relations:observacion});
            } catch(err) {
                res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
                return err;
            }
        
        } catch(err) {
            res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
        }
    
    }

});

/**
 * Ruta: Obtener plantas
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description peticion GET para obtener un listado de las plantas de la base de datos, se puede limitar la informacion mediante
 * el query 'offset' para indicar desde que elemento empieza a buscar y 'limit' para indicar el limite de respuestas. Esta ruta responde
 * con la informacion enlistada de las plantas
 */
router.get('/', async (req, res) => {
    if(req.query.limit || req.query.offset) {
        const limit = parseInt(req.query.limit,10) || 20;
        const offset = parseInt(req.query.offset,10) || 0;
        await Plantas.findAll({limit:limit,offset:offset}).then(data => {
            res.status(200).json({status:"ok",message:data});
        }).catch(err => {
            res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
        })
    } else {
        await Plantas.findAll().then(data => {
            res.status(200).json({status:"ok",message:data});
        }).catch(err => {
            res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
        })
    }

});

/**
 * Ruta: Editar planta
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description peticion PUT para editar una planta a partir del campo 'id' que se debera enviar en el body de la petición. La 'id'
 * es la id de la columna de la planta en la base de datos.
 */
router.put('/', authRoute, async (req, res) => {
    const body = req.body;

    if(Object.keys(body).length === 0) {
        res.status(400).json({status:"failed",message:"La petición no contiene información en el body"});
    }

    await Plantas.update(body,{
        where: {
            id: body.id
        }
    }).then(data => {
        if(data === 0) {
            res.status(200).json({status:"ok",message:"No se registraron cambios o la información es erronea"})
        } else {
            res.status(200).json({status:"ok",message:"La información de la planta se modifico correctamente"});
        }
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
    })
});

/**
 * Ruta: Eliminar planta
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description peticion DELETE para eliminar una planta mediante el parametro id que se coloca en el enlace
 */
router.delete('/:id', authRoute, async (req, res) => {
    const id = req.params.id;

    await Plantas.destroy({
        where: {
            id: id
        }
    }).then(data => {
        if(data === 0) {
            res.status(200).json({status:"ok",message:"No se encontro una ID para eliminar"})
        } else {
            res.status(200).json({status:"ok",message:"Planta eliminada correctamente"});
        }
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err})
    })
});

module.exports = router;