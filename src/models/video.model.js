import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, // Cloudnary se genrated url use karenge
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    timestamps: {
        type: Date,
        default: Date.now,
    },
});

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model('Video', videoSchema);

