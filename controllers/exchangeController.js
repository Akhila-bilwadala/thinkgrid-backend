import SkillExchange from '../models/SkillExchange.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Email transporter (using ethereal for testing or generic config)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'test.user@ethereal.email', // Replace with real env vars later
    pass: 'testpass'
  }
});

export const createExchangeRequest = async (req, res) => {
  try {
    const { receiverId, topic, credits } = req.body;
    const senderId = req.user.id;

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const exchange = await SkillExchange.create({
      sender: senderId,
      receiver: receiverId,
      topic,
      credits
    });

    // Populate sender name for the email
    const sender = await User.findById(senderId);

    // Send Email (Mocked with Ethereal/Logger)
    console.log(`--- Email Notification ---`);
    console.log(`To: ${receiver.email}`);
    console.log(`Subject: New Skill Exchange Request from ${sender.name}`);
    console.log(`Message: ${sender.name} wants to exchange skills on "${topic}" for ${credits} credits.`);

    // In a real scenario:
    // await transporter.sendMail({ ... });

    res.status(201).json(exchange);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyExchanges = async (req, res) => {
  try {
    const userId = req.user.id;
    const exchanges = await SkillExchange.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .populate('sender', 'name picture role company')
    .populate('receiver', 'name picture role company')
    .sort({ createdAt: -1 });

    res.json(exchanges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateExchangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduleDate, rating, review } = req.body;

    const exchange = await SkillExchange.findById(id);
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    // Update fields
    if (status) exchange.status = status;
    if (scheduleDate) exchange.scheduleDate = scheduleDate;
    if (rating !== undefined) exchange.rating = rating;
    if (review !== undefined) exchange.review = review;

    await exchange.save();

    // If completed, award points
    if (status === 'completed' && rating >= 4) {
      const receiver = await User.findById(exchange.receiver);
      receiver.points += exchange.credits * 2; // Example points logic
      await receiver.save();
    }

    res.json(exchange);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
