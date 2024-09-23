import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";

dotenv.config();

export const contactCollection = db.collection("List");

//------------List Additions------------------------//

export const addContact = async (req, res) => {
  const { email, phone, userId } = req.body;

  try {
    // Find the contact list by userId
    const list = await contactCollection.findOne({ Id: userId });
    if (list) {
      // Update the existing list by pushing the new email and phone
      await contactCollection.updateOne(
        { Id: userId },
        {
          $push: {
            mailId: email,
            phoneNum: phone,
          },
        }
      );
      return res
        .status(200)
        .json({ msg: "Contact added successfully to the list" });
    } else {
      // If no list exists for the user, create a new one
      const newList = await contactCollection.insertOne({
        mailId: [email],
        phoneNum: [phone],
        Id: userId,
      });
      if (newList) {
        return res
          .status(200)
          .json({ msg: "List created and contact added successfully" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Server Error" });
  }
};
