export const notLoggedIn = (res) => {
    var err = new Error("You are not logged in.");
    err.status = 403;
    return res.status(err.status).json({ err });
};

export const notAuthorized = (res) => {
    var err = new Error("You are not authorized.");
    err.status = 401;
    return res.status(err.status).json({ err });
};

export const notValid = (res) => {
    var err = new Error("You request is not valid.");
    err.status = 400;
    return res.status(err.status).json({ err });
};

export const notFound = (res, name) => {
    var err = new Error(`${name} not found.`);
    err.status = 404;
    return res.status(err.status).json({ err });
};

export const emailNotSent = (res) => {
    var err = new Error("Unable to send mail rightnow. Try again later.");
    err.status = 503;
    return res.status(err.status).json({ err });
};

export const dataUnaccesable = (res) => {
    var err = new Error("Unable to connect to database rightnow. Try again later.");
    err.status = 503;
    return res.status(err.status).json({ err });
};
