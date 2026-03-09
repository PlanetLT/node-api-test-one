import { createServiceError } from "../utils/serviceError.js";

const buildImageUploadResponse = ({ protocol, host, filename }) => {
    if (!filename) {
        throw createServiceError(400, "image_file_required");
    }

    return {
        message: "file_upload_success",
        imagePath: `${protocol}://${host}/uploads/images/${filename}`,
    };
};

export { buildImageUploadResponse };
