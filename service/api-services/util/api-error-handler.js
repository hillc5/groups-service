/**
 * Builds and returns a new function that handles any errors that come back during api and data operations.
 * The error messages are normalized and sent back to the client via the res object
 *
 * @param  {Response} res - The Response object to send back to the client
 * @return {Function} - Function that will handle the errors and send them via tha res object
 */
function handleError(res) {
    return err => {
        // err.mapped occurs when req.check... throws an error
        if (err && err.mapped) {
            res.status(400).send(mapExpressValidatorError(err));
        } else {
            const { status=500, message='There was an error with your request.  Try again later' } = err;
            res.status(status).send([ { status, message } ]);
        }
    };
}

function mapExpressValidatorError(err) {

    return err.array()
            .map(error =>
                ({ status: 404, parameter: error.param, message: error.msg })
            );
}

module.exports = handleError;
