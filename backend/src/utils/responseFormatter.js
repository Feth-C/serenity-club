// backend/src/utils/responseFormatter.js

const formatResponse = (data = null, message = '') => {
    return {
        status: 'success',
        message,
        data
    };
};

const formatError = (message = 'Erro', statusCode = 400) => {
    return {
        status: 'error',
        error: message,
        statusCode
    };
};

module.exports = formatResponse;
