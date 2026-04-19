const nsfwjs = require('nsfwjs');
const tf = require('@tensorflow/tfjs');
const axios = require('axios');
const jpeg = require('jpeg-js');

let model = null;

const loadModel = async () => {
    if (!model) {
        // Use the JS-only version of the model
        model = await nsfwjs.load();
    }
    return model;
};

/**
 * Checks if an image is NSFW.
 * @param {string} imageUrl The URL of the image to check.
 * @returns {Promise<boolean>} True if NSFW, false otherwise.
 */
const checkImageNSFW = async (imageUrl) => {
    try {
        // Ensure we are getting a JPEG from Cloudinary for decoding
        const scanUrl = imageUrl.includes('cloudinary.com') 
            ? imageUrl.replace(/\.[^/.]+$/, ".jpg") 
            : imageUrl;

        const response = await axios.get(scanUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        // Convert buffer to pixels
        const { data, width, height } = jpeg.decode(buffer, true);
        const numChannels = 3;
        const numPixels = width * height;
        const values = new Int32Array(numPixels * numChannels);

        for (let i = 0; i < numPixels; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                values[i * numChannels + channel] = data[i * 4 + channel];
            }
        }

        const input = tf.tensor3d(values, [height, width, numChannels], 'int32');
        
        const currentModel = await loadModel();
        const predictions = await currentModel.classify(input);
        
        // Cleanup tensor
        input.dispose();

        // High risk categories
        const nsfwFound = predictions.some(p => 
            (p.className === 'Porn' || p.className === 'Hentai' || p.className === 'Sexy') && p.probability > 0.6
        );

        return nsfwFound;
    } catch (error) {
        console.error("Backend NSFW Check Failed:", error.message);
        // If check fails, we might want to fail-safe or fail-strict.
        // For security, let's log and proceed but maybe mark for human review?
        // For now, let's return false (allowed) but log the error.
        return false; 
    }
};

module.exports = { checkImageNSFW };
