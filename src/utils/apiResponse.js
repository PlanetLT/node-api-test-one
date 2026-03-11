import i18next from "../i18n.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

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
    {
        statusCode = HTTP_STATUS.OK,
        message = "success",
        messageParams = null,
        data = null,
    } = {}
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
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
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
