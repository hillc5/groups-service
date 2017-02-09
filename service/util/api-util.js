const { sendError, validateRequest } = require('./validation');

function apiWrapper({ req, res, paramOptions=[], bodyOptions=[], queryOptions=[], apiFn=() => undefined }) {
    validateRequest({ req, paramOptions, bodyOptions, queryOptions })
        .then(() => apiFn)
        .catch(sendError(res));
}

module.exports = apiWrapper;
