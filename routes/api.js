'use strict';
const StockModel = require("../models").Stock;
const fetch = require('node-fetch');

async function getStock(stock) {
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
  const { symbol, latestPrice } = await response.json();
  return { symbol, latestPrice };
}

async function createStock(stock, like) {
  const likes = like ? 1 : 0; // Initialize likes count based on whether the user liked the stock
  const newStock = new StockModel({ symbol: stock, likes });
  return await newStock.save();
}

async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

async function saveStock(stock, like, ip) {
  let saved = {};

  const foundStock = await findStock(stock);
  if (!foundStock) {
    saved = await createStock(stock, like);
  } else {
    if (like && !foundStock.likes.includes(ip)) {
      foundStock.likes.push(ip);
    }
    saved = await foundStock.save();
  }

  return saved;
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      
      if (!stock) {
        return res.status(400).json({ error: 'Stock symbol is required' });
      }

      if (Array.isArray(stock)) {
        // Handling multiple stocks
        const [stock1, stock2] = stock;
        const [data1, data2] = await Promise.all([getStock(stock1), getStock(stock2)]);
        const [savedStock1, savedStock2] = await Promise.all([
          saveStock(stock1, like, req.ip),
          saveStock(stock2, like, req.ip)
        ]);

        const stockData = [
          {
            stock: data1.symbol,
            price: data1.latestPrice,
            rel_likes: savedStock1.likes - savedStock2.likes
          },
          {
            stock: data2.symbol,
            price: data2.latestPrice,
            rel_likes: savedStock2.likes - savedStock1.likes
          }
        ];

        return res.json({ stockData });
      } else {
        // Handling single stock
        const { symbol, latestPrice } = await getStock(stock);
        if (!symbol) {
          return res.json({ stockData: { likes: like ? 1 : 0 } });
        }

        const savedStock = await saveStock(symbol, like, req.ip);
        const likesCount = savedStock.likes.length || 0;

        return res.json({
          stockData: {
            stock: symbol,
            price: latestPrice,
            likes: likesCount
          }
        });
      }
    });
};
