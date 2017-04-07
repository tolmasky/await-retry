
module.exports = function retry(aFunction, options)
{
    if (!options)
        options = { };

    var delay = options.delay === undefined ? 0 : options.delay;
    var times = options.times === undefined ? Infinity : options.times;

    return internal(aFunction, delay, times);
}

function internal(aFunction, delayTime, times)
{
    return new Promise(function (resolve, reject)
    {
        return aFunction()
            .catch (function (anError)
            {
                if (times <= 0)
                    return reject(new RetryError(anError));
            
                return delay(delayTime)
                    .then(function ()
                    {
                        return internal(aFunction, times - 1, delay)
                    });
            })
            .then(resolve)
            .catch(reject);
    });
}

function delay(delay)
{
    return new Promise(function (resolve, reject)
    {
        setTimeout(resolve, delay);
    });
}

function RetryError()
{
    const error = new Error("No more retries");

    Object.defineProperty(error, "name",
    {
        value: "RetryError",
        writable: true,
        enumerable: false,
        configurable: true
    });

    Object.setPrototypeOf(error, RetryError.prototype);

    return error;
}

RetryError.prototype = Object.create(Error.prototype);
RetryError.prototype.constructor = RetryError;
