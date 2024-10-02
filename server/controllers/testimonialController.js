import { db } from "../DB/mongo-db.js";
import { authCollection } from "../controllers/authController.js";
import { ObjectId } from "mongodb";

const testimonialCollection = db.collection("Testimonials");

//------------Testimonial Link Creation------------------------//

export const storeTestimonialLink = async (req, res) => {
  const { userId, uniqueString } = req.body;
  try {
    const objectId = ObjectId.createFromHexString(userId);
    // Check if the user exists in the authCollection
    const user = await authCollection.findOne({ _id: objectId });
    const testimonialUser = await testimonialCollection.findOne({ Id: userId });
    const date = new Date().toLocaleString(undefined, {
      timeZone: "Asia/Kolkata",
    });
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }
    if (!testimonialUser) {
      await testimonialCollection.insertOne({
        Id: userId,
        TestimonialStr: uniqueString,
        createdOn: date,
      });
    } else {
      await testimonialCollection.updateOne(
        { Id: userId },
        {
          $set: { TestimonialStr: uniqueString, createdOn: date },
        }
      );
    }
    return res.status(200).send({ msg: "Successfully created" });
  } catch (error) {
    return res.status(500).send({ msg: "Server error" });
  }
};

//--------------------Get Testimonial------------------------//

export const getTestimonial = async (req, res) => {
  const { userId } = req.body;
  try {
    const objectId = ObjectId.createFromHexString(userId);
    const user = await authCollection.findOne({ _id: objectId });
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }
    const testimonial = await testimonialCollection.findOne({ Id: userId });
    if (!testimonial) {
      return res
        .status(404)
        .send({ msg: "No testimonial Link Found Generate One" });
    }
    const testimonialFromClient = await testimonialCollection.findOne({
      Id: userId,
    });
    return res.status(200).json({ testimonials: testimonialFromClient });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error" });
  }
};

//--------------------Record Testimonial------------------------//

export const recordTestimonial = async (req, res) => {
  const { ratings, feedBack, paramStr, clientName, clientEmail } = req.body;
  try {
    const checkLinkAndUser = await testimonialCollection.findOne({
      TestimonialStr: paramStr,
    });
    if (!checkLinkAndUser) {
      return res.status(404).send({ msg: "Invalid or expired link" });
    }
    if (!checkLinkAndUser.testimonial && !checkLinkAndUser.testimonial) {
      await testimonialCollection.updateOne(
        { TestimonialStr: paramStr },
        {
          $set: {
            testimonial: [
              {
                ratings,
                feedBack,
                clientName,
                clientEmail,
                reviewed: true,
              },
            ],
          },
        }
      );
    } else {
      // Check if a testimonial with the same clientEmail already exists
      const existingTestimonial = await testimonialCollection.findOne({
        TestimonialStr: paramStr,
        "testimonial.clientEmail": clientEmail,
      });
    
      if (existingTestimonial) {
        // If testimonial with the same clientEmail exists, update the matching testimonial
        await testimonialCollection.updateOne(
          { TestimonialStr: paramStr, "testimonial.clientEmail": clientEmail },
          {
            $set: {
              "testimonial.$.ratings": ratings,
              "testimonial.$.feedBack": feedBack,
              "testimonial.$.clientName": clientName,
              "testimonial.$.reviewed": true,
            },
          }
        );
      } else {
        // If testimonial with the same clientEmail doesn't exist, push a new testimonial
        await testimonialCollection.updateOne(
          { TestimonialStr: paramStr },
          {
            $push: {
              testimonial: {
                ratings,
                feedBack,
                clientName,
                clientEmail,
                reviewed: true,
              },
            },
          }
        );
      }
    }
    return res.status(200).send({ msg: "Testimonial recorded successfully" });
  } catch (error) {
    return res.status(500).send({ msg: "Server Error" });
  }
};
