function createValidationSchema(schemaType, fields) {
    let schema = {},
        type = schemaType.toLowerCase();

    fields.forEach(field => {
        schema[field] = validationMap[type][field];
    });

    return schema;
}

/**
 * Checks the request body and request parameters for any invalid attributes.
 * Trims all inputs so that leading/trailing whitespace does not get added to
 * the data stores.
 *
 * @param  {HttpRequest} options.req         The node/express req object
 * @param  {String} options.validationType   model type, e.g. 'group' or 'member'
 * @param  {Array}  options.paramOptions     parameters that need to be validated
 * @param  {Array}  options.bodyOptions      body params that need to be validated
 * @return {Promise}                         Promise resolved with response, or rejected with error
 */
function validateRequest({ req, validationType, paramOptions=[], bodyOptions=[] }={}) {
    const paramValidationSchema = createValidationSchema(validationType, paramOptions),
          bodyValidationSchema = createValidationSchema(validationType, bodyOptions);

    // trim ALL the things!
    [ ...paramOptions, ...bodyOptions ].forEach(option => {
        req.sanitize(option).trim();
    });

    req.checkParams(paramValidationSchema);
    req.checkBody(bodyValidationSchema);

    // result.throw() only throws an error if there is an actual error present on the result
    return req.getValidationResult().then(result => result.throw());
}

function sendError(res) {
    return (err) => {
        if (err && err.mapped) {
            res.status(400).send(err.mapped());
        } else {
            const { status=500, message='There was an error with your request.  Try again later' } = err;
            res.status(status).send({ status, message });
        }
    };
}

const sharedMappings = {
    'id': {
        isMongoId: {
            errorMessage: 'id must be a valid MongoDB ObjecttId'
        }
    },
    'name': {
        notEmpty: true,
        errorMessage: 'Member name is required'
    }
}

const validationMap = {
    group: {
        'id': sharedMappings.id,
        'memberId': sharedMappings.id,
        'name': sharedMappings.name,
        'isPublic': {
            isBoolean: {
                errorMessage: 'isPublic must be a boolean'
            }
        }
    },
    member: {
        'id': sharedMappings.id,
        'name': sharedMappings.name,
        'email': {
            isEmail: {
                errorMessage: 'A valid email address is required'
            }
        }
    }
}

module.exports = {
    validateRequest,
    createValidationSchema,
    sendError,
    validationMap
};