const express = require('express');
const router = express.Router();
const authRoute = require('../middleware.js');
const { Observaciones } = require('../models.js')
const { Op } = require('sequelize');
const { removeFile } = require('../AWS/S3Client.js')


router.post('/', authRoute, async (req, res) => {
    const body = req.body;

    await Observaciones.create(body).then(data => {
        res.status(200).json({status:"ok",message:"Observación cargada a la base de datos"});
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err})
    })
});


router.get('/:id', async (req, res) => {
    const id = req.params.id;

    await Observaciones.findAll({
        where: {
            id: id
        }
    }).then(data => {
        res.status(200).json({status:"ok",message:data});
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
    })
});


router.get('/', async (req, res) => {
    const body = req.body;

    await Observaciones.findAll().then(data => {
        res.status(200).json({status:"ok",message:data});
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
    })
});


router.put('/', authRoute, async (req, res) => {
    const body = req.body;

    if(Object.keys(body).length === 0) {
        res.status(400).json({status:"failed",message:"La petición no contiene información en el body"});
        return;
    }

    await Observaciones.update(body,{
        where: {
            id: body.id
        }
    }).then(data => {
        if(data[0] === 0) {
            res.status(200).json({status:"ok",message:"No se registraron cambios o la información es erronea"})
        } else {
            res.status(200).json({status:"ok",message:"La información de la observación se modifico correctamente",data});
        }
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
    })
});


router.delete('/:id', authRoute, async (req, res) => {
    const id = req.params.id;
    let pathImg;
    try {
        pathImg = await Observaciones.findOne({where:{id:id}});
        if(!pathImg) {
            return res.status(200).json({status:"ok",message:"No se encontro una ID para eliminar"});
        }
    } catch (err) {
        return res.status(200).json({status:"ok",message:"No se encontro una ID para eliminar"});
    }

    await Observaciones.destroy({
        where: {
            id: id
        }
    }).then(async data => {
        if(data === 0) {
            res.status(200).json({status:"ok",message:"No se encontro una ID para eliminar"})
        } else {
            if(pathImg.dataValues.imagenes.rutas.length == 1) {
                await removeFile(pathImg.dataValues.imagenes.rutas[0])
            } else if(pathImg.dataValues.imagenes.rutas.length > 1) {
                const array = [...pathImg.dataValues.imagenes.rutas];
                console.log(array)
                await Promise.all(array.map(async data => {
                    await removeFile(data);
                }));
            }
            res.status(200).json({status:"ok",message:"Observación eliminada correctamente",filePath:pathImg.dataValues.imagenes.rutas});
        }
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err})
    })
});

module.exports = router;