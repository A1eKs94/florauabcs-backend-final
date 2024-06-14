/**
 * Remplazar guiones por slash
 * @param {*} str texto a convertir
 * @returns el mismo texto con los guiones remplazados por slash
 */
function replaceHyphensWithSlashes(str) {
    return str.replace(/-/g, '/');
}

function replaceSlashesWithHyphens(str) {
    return str.replace('/', '-');
}

const isEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isPassword = (password) => {
    return password.length > 6;
};

const isName = (name) => {
    // Expresión regular para verificar nombres de personas
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ' -]+$/;
    return nameRegex.test(name);
};

module.exports = {
    replaceHyphensWithSlashes,
    replaceSlashesWithHyphens,
    isEmail,
    isPassword,
    isName
}