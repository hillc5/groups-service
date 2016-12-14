function createValidationSchema(fields) {
    let schema = {};

    fields.forEach(field => {
        schema[field] = validationMap[field];
    });

    return schema;
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

const validationMap = {
    'id': {
        isMongoId: {
            errorMessage: 'id must be a valid MongoDB ObjecttId'
        }
    },
    'name': {
        notEmpty: true,
        errorMessage: 'Member name is required'
    },
    'email': {
        isEmail: {
            errorMessage: 'A valid email address is required'
        }
    }
}

module.exports = {
    createValidationSchema,
    sendError,
    validationMap
};
