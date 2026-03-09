import i18next from "../i18n.js";

const translate = (res, message, messageParams = {}) => {
    if (!message) {
        return message;
    }

    const requestT = res?.req?.t?.bind(res.req);
    const t = requestT || i18next.t.bind(i18next);
    return t(message, { defaultValue: message, ...messageParams });
};

const sendSuccess = (
    res,
    { statusCode = 200, message = "success", messageParams = null, data = null } = {}
) => {
    const localizedMessage = translate(res, message, messageParams);

    return res.status(statusCode).json({
        success: true,
        message: localizedMessage,
        data,
    });
};

const sendError = (
    res,
    {
        statusCode = 500,
        message = "internal_server_error",
        messageParams = null,
        errors = null,
    } = {}
) => {
    const localizedMessage = translate(res, message, messageParams);

    return res.status(statusCode).json({
        success: false,
        message: localizedMessage,
        errors,
    });
};

export { sendSuccess, sendError };
