/**
 * Checks the request body, request query and request parameters for any invalid attributes.
 * Trims all inputs so that leading/trailing whitespace does not get added to
 * the data stores.
 *
 * @param  {HttpRequest} options.req         The node/express req object
 * @param  {Array}  options.paramOptions     parameters that need to be validated
 * @param  {Array}  options.bodyOptions      body params that need to be validated
 * @return {Promise}                         Promise resolved with response, or rejected with error
 */
function validateRequest({ req, paramOptions=[], bodyOptions=[], queryOptions=[] }={}) {
    const paramValidationSchema = createValidationSchema(paramOptions),
          bodyValidationSchema = createValidationSchema(bodyOptions),
          queryValidationSchema = createValidationSchema(queryOptions);

    // trim ALL the things!
    [ ...paramOptions, ...bodyOptions, ...queryOptions ].forEach(option => {
        req.sanitize(option).trim();
    });

    req.checkParams(paramValidationSchema);
    req.checkBody(bodyValidationSchema);
    req.checkQuery(queryValidationSchema)

    // result.throw() only throws an error if there is an actual error present on the result
    return req.getValidationResult().then(result => result.throw());
}

function createValidationSchema(fields) {
    let schema = {};

    fields.forEach(field => {
        schema[field] = validationMap[field];
    });

    return schema;
}

function sendError(res) {
    return err => {
        // err.mapped occurs when req.check... throws an error
        if (err && err.mapped) {
            res.status(400).send(err.mapped());
        } else {
            const { status=500, message='There was an error with your request.  Try again later' } = err;
            res.status(status).send({ status, message });
        }
    };
}

const sharedMappings = {
    id: (value) => ({
        optional: true,
        isMongoId: {
            errorMessage: `${value} must be a valid MongoDB ObjectId`
        }
    }),
    date: {
        isDate: {
            errorMessage: 'startDate must be a valid Date string'
        }
    }
};

const validationMap = {
    owner: sharedMappings.id('owner'),
    groupId: sharedMappings.id('groupId'),
    memberId: sharedMappings.id('memberId'),
    eventId: sharedMappings.id('eventId'),
    startDate: sharedMappings.date,
    endDate: sharedMappings.date,
    text: {
        notEmpty: true,
        errorMessage: 'Text is required'
    },
    name: {
        notEmpty: true,
        errorMessage: 'Name is required'
    },
    email: {
        isEmail: {
            errorMessage: 'A valid email address is required'
        }
    },
    isPublic: {
        isBoolean: {
            errorMessage: 'isPublic must be a boolean'
        }
    }
}

module.exports = {
    validateRequest,
    sendError
};
