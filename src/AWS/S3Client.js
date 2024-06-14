const { PutObjectCommand, S3Client, ListObjectsCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const cuid = require('@paralleldrive/cuid2');
const {replaceHyphensWithSlashes, replaceSlashesWithHyphens} = require('../utils.js');

require('dotenv').config();

/**
 * Acceso a AWS S3
 * 
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Subir archivo
 * @param {*} file enlace del archivo temporal, el enlace
 * se obtiene desde el req.files del metodo post o put
 * @returns la respuesta de la operación en cadena de texto
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
async function uploadFile(file) {
    const stream = fs.createReadStream(file.tempFilePath);
    const fileFormat = file.name.split('.').pop();
    const fileName = cuid.createId();
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `imagenes/${fileName}.${fileFormat}`,
        Body: stream
    }

    const command = new PutObjectCommand(uploadParams);
    const response = await client.send(command);
    return replaceSlashesWithHyphens(uploadParams.Key);
}

/**
 * Obtener listado de imagenes S3
 * @returns en arreglo, los metadatos de las imagenes en el bucket vinculado en las variables del entorno
 * @author Yahir Emmanuel Romo Palomino
 * @version 1.0
 */
async function getFiles() {
    const command = new ListObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: 'imagenes/'
    })

    const response = await client.send(command);
    return response.Contents;
}

/**
 * Obtener el archivo del bucket
 * @param {*} AWS_path enlace del bucket, se obtiene de la base de datos
 * @returns respuesta de la promesa que se envia al bucket
 */
async function getFile(AWS_path) {
    const path = replaceHyphensWithSlashes(AWS_path);
    console.log("AAAAAAAAAAAAAAAAAAAA:",path);
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path
    });
    
    return await client.send(command);
}

// TODO: Hacer la funcion para eliminar un archivo por medio de su path en el bucket
async function removeFile(AWS_path) {
    const path = replaceHyphensWithSlashes(AWS_path);
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path
    });

    return await client.send(command);
}

module.exports = {
    uploadFile,
    getFiles,
    getFile,
    removeFile
}