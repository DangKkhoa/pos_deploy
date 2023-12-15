const express = require('express');
const router = express.Router();
const customerService = require('../service/customerLookup');

router.get('/lookup/:phoneNumber', async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  try {
    const customerInfo = await customerService.lookupCustomerByPhone(phoneNumber);
    res.json(customerInfo);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;