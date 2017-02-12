function handleError(res) {
    return err => {
        // err.mapped occurs when req.check... throws an error
        // TODO standardize the return so that the error message
        // is the same shape as that thrown here and from data methods
        // such as the message being stored in .message rather than .msg
        if (err && err.mapped) {
            res.status(400).send(err.mapped());
        } else {
            const { status=500, message='There was an error with your request.  Try again later' } = err;
            res.status(status).send({ status, message });
        }
    };
}

module.exports = handleError;