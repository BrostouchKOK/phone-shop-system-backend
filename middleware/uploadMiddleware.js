import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'phone-shop-products', // ឈ្មោះ Folder នៅក្នុង Cloudinary
        allowed_formats: ['jpg','jpeg', 'png', 'webp'],
    },
});

const upload = multer({ storage: storage });
export default upload;