const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {Cuentas} = require('../models.js')
const {isEmail,isPassword,isName} = require('../utils.js')
const authRoute = require('../middleware.js')

const generateToken = (account) => {
    const payload = { correo: account.correo };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '48h' };
    return jwt.sign(payload, secret, options);
};

/**
 * Registro:
 * 
 * - nombre
 * - apellidos
 * - correo
 * - password
 */
router.post('/register', async (req, res) => {
    const body = req.body;

    if(!isEmail(body.correo)) {
        res.status(400).json({status:"failed",message:"El correo no es valido"})
        return;
    }

    if(!isPassword(body.password)) {
        res.status(400).json({status:"failed",message:"La contraseña debe tener mas de 6 caracteres"})
        return;
    }

    if(!isName(body.nombre) || !isName(body.apellidos)) {
        res.status(400).json({status:"failed",message:"Nombre o apellido invalido"})
        return;
    }
    await Cuentas.create({
        correo: body.correo,
        password: await bcrypt.hash(body.password, await bcrypt.genSalt(10)),
        nombre: body.nombre,
        apellidos: body.apellidos
    }).then(data => {
        res.status(200).json({status:"ok",message:"Usuario registrado correctamente"});
    }).catch(err => {
        res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err})
    });

});

/**
 * login:
 * 
 * - correo
 * - password
 */
router.post('/login', async (req, res) => {
    const body = req.body;
    
    if(!isEmail(body.correo) || !isPassword(body.password)) {
        res.status(400).json({status:"failed",message:"Autenticación fallida, revise los datos. 1"});
        return;
    }

    const account = await Cuentas.findOne({
        where: {
            correo: body.correo
        }
    }).catch(err => {
        res.status(400).json({status:"failed",message:"Autenticación fallida, revise los datos. 2"});
        return;
    })

    if(!account) {
        res.status(400).json({status:"failed",message:"Autenticación fallida, revise los datos. 3"});
        return;
    }

    if(await bcrypt.compare(body.password,account.dataValues.password)) {
        const token = generateToken(account);

        res.status(200).json({status:"ok",message:"Autenticación validada",token:`${token}`});
    } else {
        res.status(400).json({status:"failed",message:"Autenticación fallida, revise los datos. 4"});
    }
});

/**
 * correo
 */
router.post('/admin/grant', authRoute, async (req, res) => {
    const body = req.body;
    
    if(Object.keys(body).length === 0) {
        return res.status(400).json({status:"failed",message:"La petición no contiene información en el body"});
    }

    try{
        const response = await Cuentas.update({
            rol: 10
        },{
            where: {
                correo: body.correo
            }
        });

        if(response[0] == 0) {
            return res.status(400).json({status:"failed",message:"No se encontro una cuenta o tiene el mismo rol"});
        }
    } catch(err) {
        return res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
    }

    res.status(200).json({status:"ok",message:`La cuenta ${body.correo} ahora es administrador.`});
});

/**
 * correo
 */
router.post('/admin/revoke', authRoute, async (req, res) => {
    const body = req.body;
    
    if(Object.keys(body).length === 0) {
        return res.status(400).json({status:"failed",message:"La petición no contiene información en el body"});
    }

    try{
        const response = await Cuentas.update({
            rol: 1
        },{
            where: {
                correo: body.correo
            }
        });

        if(response[0] == 0) {
            return res.status(400).json({status:"failed",message:"No se encontro una cuenta o tiene el mismo rol"});
        }
    } catch(err) {
        return res.status(400).json({status:"failed",message:"La API no puede procesar la solicitud",error_status:err});
    }

    res.status(200).json({status:"ok",message:`La cuenta ${body.correo} ya no es administrador.`});
});

router.get('/account/:token', authRoute, async (req, res) => {
    const token = req.params.token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const response = await Cuentas.findOne({
            where: {
                correo: decoded.correo
            }
        })

        console.log(response);

        res.status(200).json({status:"ok",message:`Cuenta decodificada`,account:response});
    } catch (err) {
        res.status(400).json({status:"ok",message:`Token invalido`});
    }
});

module.exports = router;