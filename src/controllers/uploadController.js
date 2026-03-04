const uploadImageFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Image file is required. Use form-data key: image" });
    }

    const imagePath = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;

    return res.status(201).json({
        message: "Image uploaded successfully",
        imagePath,
    });
};

export { uploadImageFile };
