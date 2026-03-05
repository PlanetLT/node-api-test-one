const buildImageUploadResponse = ({ protocol, host, filename }) => {
    if (!filename) {
        const error = new Error("Image file is required. Use form-data key: image");
        error.status = 400;
        throw error;
    }

    return {
        message: "Image uploaded successfully",
        imagePath: `${protocol}://${host}/uploads/images/${filename}`,
    };
};

export { buildImageUploadResponse };
