const predictClassification = require('../services/inferenceService');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 dari modul uuid
const storeData = require('../services/storeData');
const { Firestore } = require('@google-cloud/firestore');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { label, suggestion } = await predictClassification(model, image);
  
  if (label && suggestion) {
    const id = uuidv4(); // Menggunakan uuidv4() untuk menghasilkan UUID secara acak
    const createdAt = new Date().toISOString();

    const data = {
      "id": id,
      "result": label,
      "suggestion": suggestion,
      "createdAt": createdAt
    };

    await storeData(id, data);

    const response = h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data
    });
    response.code(201);
    return response;
  } else {
    const response = h.response({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi'
    });
    response.code(400);
    return response;
  }
}

const getPredictionHandler = async (request, h) => {
  try {
    const db = new Firestore();
    const snapshot = await db.collection('predictions').get();
    const histories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        history: {
          result: data.result,
          createdAt: data.createdAt,
          suggestion: data.suggestion,
          id: doc.id
        }
      };
    });

    if (histories.length > 0) {
      return h.response({
        status: 'success',
        data: histories
      }).code(200);
    } else {
      return h.response({
        status: 'success',
        data: [],
        message: 'Tidak ada riwayat prediksi yang ditemukan'
      }).code(200);
    }
  } catch (err) {
    console.error(err);
    return h.response({
      status: 'fail',
      message: 'Gagal mengambil riwayat prediksi'
    }).code(500);
  }
};

module.exports = { postPredictHandler, getPredictionHandler };
