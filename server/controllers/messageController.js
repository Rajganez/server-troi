import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";
import { contactCollection } from "../controllers/contactsController.js";
// import Twilio from "twilio/lib/rest/Twilio.js";

dotenv.config();

export const messageCollection = db.collection("SMSCollection");

// const client = new Twilio(process.env.SMS_ACC_SID, process.env.SMS_AUTH_TOKEN);

//---------------Send SMS------------------------//

export const sendSMS = async (req, res) => {
  const { userId, smsMessageData, toPhone } = req.body;
  try {
    const user = await contactCollection.findOne({ Id: userId });
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }
    //toPhone = [{Ganesh: "9597288444"}, {Anu12: "9977665511"}]
    // const phoneNum = Object.values(toPhone);

    // for (let num of phoneNum) {
      // Send SMS using Twilio
      // await client.messages.create({
      //   // messagingServiceSid : process.env.SMS_SERVICE_ID,
      //   body: smsMessageData,
      //   // to: "+918838539223",
      //   from: '+15705593334',
      //   to: '+918838539223',
      // });
    // }
  } catch (error) {
    console.log(error);
  }
};


