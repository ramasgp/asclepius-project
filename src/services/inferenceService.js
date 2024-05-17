const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.node
      .decodeJpeg(image)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat()

    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    const label = confidenceScore > 50 ? 'Cancer' : 'Non-cancer'

    let suggestion;

    if (label === 'Cancer') {
      suggestion = "Segera konsultasi dengan dokter terdekat untuk meminimalisasi penyebaran kanker.";
    }
    
    if (label === 'Non-cancer') {
      suggestion = "Anda sehat! Tetap jaga pola hidup sehat dan lakukan pemeriksaan rutin.";
    }    
  
    return { label, suggestion };
  } catch (error) {
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
  }
}

module.exports = predictClassification;