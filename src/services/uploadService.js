import { createServiceError } from "../utils/serviceError.js";

const buildImageUploadResponse = ({ protocol, host, filename }) => {
    if (!filename) {
        throw createServiceError(400, "Image file is required. Use form-data key: image");
    }

    return {
        message: "Image uploaded successfully",
        imagePath: `${protocol}://${host}/uploads/images/${filename}`,
    };
};

export { buildImageUploadResponse };
