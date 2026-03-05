import { buildImageUploadResponse } from "../services/uploadService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const uploadImageFile = async (req, res) => {
    try {
        const payload = buildImageUploadResponse({
            protocol: req.protocol,
            host: req.get("host"),
            filename: req.file?.filename,
        });

        return sendSuccess(res, {
            statusCode: 201,
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
