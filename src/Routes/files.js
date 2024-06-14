const express = require('express');
const router = express.Router();
const authRoute = require('../middleware.js');
const { uploadFile,getFiles,getFile } = require('../AWS/S3Client.js');

/**
 * Subir archivo desde API
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 * @description esta ruta permite enviar uno o mas archivos al bucket, el nombre del campo debe estar nombrado
 * como "img"
 */
router.post('/', authRoute, async (req, res) => {
    if(!req.files) {
        res.status(400).send({status:"failed",message:"No se enviaron archivos"});
        return;
    }

    const file = req.files.img
    
    if(!file || file.length === 0) {
        res.status(400).send("No se enviaron archivos");
        return;
    } else {
        if(file.length === undefined) {
            const response = await uploadFile(file);
            res.status(200).json({status:"ok",message:`Archivo cargado correctamente`,filePath:[response]});
        } else {
            const files = await Promise.all(file.map(async element => {
                const fileName = await uploadFile(element);
                return fileName;
            }));
            
            res.status(200).json({status:"ok",message:"Archivos cargados correctamente",filePath:files});
        }
    }

});

/**
 * Obtener listado de los metadatos de los archivos desde el bucket de AWS
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
router.get('/', async (req, res) => {
    const response = await getFiles();

    res.json({status:"ok",message:response});
});

/**
 * Obtener archivo desde el bucket de AWS
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
router.get('/:file', async (req, res) => {
    const filePath = req.params.file;
    try {
        const fileData = await getFile(filePath);
        fileData.Body.pipe(res);
    } catch {
        res.status(404).send('Archivo no encontrado');
    }
});

module.exports = router;