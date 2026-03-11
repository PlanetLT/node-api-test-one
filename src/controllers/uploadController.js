import { buildImageUploadResponse } from "../services/uploadService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const uploadImageFile = async (req, res) => {
    try {
        const payload = buildImageUploadResponse({
            protocol: req.protocol,
            host: req.get("host"),
            filename: req.file?.filename,
        });

        return sendSuccess(res, {
            statusCode: HTTP_STATUS.CREATED,
            message: payload.message,
            data: { imagePath: payload.imagePath },
        });
    } catch (error) {
        if (error?.status) {
            return sendError(res, { statusCode: error.status, message: error.message });
        }
        return sendError(res);
    }
};

export { uploadImageFile };
