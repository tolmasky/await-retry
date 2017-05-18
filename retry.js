

module.exports = function retry(aFunction, options)
{
    if (!options)
        options = { };

    const delay = options.delay === undefined ? 0 : options.delay;
    const maximumRetries = options.maximumRetries === undefined ? Infinity : options.maximumRetries;
    const onlyRetryIf = typeof options.onlyRetryIf === "function" ? options.onlyRetryIf : () => true;

    return internal(aFunction, delay, maximumRetries, onlyRetryIf);
}

function internal(aFunction, delayTime, maximumRetries, onlyRetryIf)
{
    return new Promise (resolve => resolve(aFunction()))
        .catch (function (anError)
        {
            if (maximumRetries <= 0 || !onlyRetryIf(anError))
                throw new RetryError(anError);

            return delay(delayTime)
                .then(() => internal(aFunction, delayTime, maximumRetries - 1, onlyRetryIf));
        });
}

function delay(delay)
{
    return new Promise(resolve => setTimeout(resolve, delay));
}

function RetryError(anError)
{
    const error = new Error("No more retries");

    Object.defineProperty(error, "name",
    {
        value: "RetryError",
        writable: true,
        enumerable: false,
        configurable: true
    });

    error.cause = anError;

    Object.setPrototypeOf(error, RetryError.prototype);

    return error;
}

RetryError.prototype = Object.create(Error.prototype);
RetryError.prototype.constructor = RetryError;
