import mongoose, { mongo } from "mongoose";

const PostSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true,
        unique: true
    },
    tags: {
        type: Array,
        default: []
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    user:{
        type: mongoose.Schema.Types.ObjectId, // у каждой статьи есть автор, так мы заходим в монгус, и находим тип ObjectId
        ref: "User",// по этому id ссылаемся на модель user 
        required: true 
    },
    imageUrl: String
}, {timestamps: true});

export default mongoose.model("Post", PostSchema); 