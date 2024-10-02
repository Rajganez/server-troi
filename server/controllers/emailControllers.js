import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";
import { authCollection } from "../controllers/authController.js";
import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";

dotenv.config();

export const emailCollection = db.collection("EmailCollection");

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "trueroiservices@gmail.com",
    pass: process.env.MAIL_APP_PASSWORD,
  },
  timeout: 30000,
});

export const mailOptions = {
  from: "trueroiservices@gmail.com",
};

// Function to generate the HTML email template
const generateEmailTemplate = (
  companyName,
  greetingMessage,
  leadMessage,
  additionalMessage,
  contactMessage,
  signatureData,
  recipientName,
  recipientEmail,
  userId
) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${companyName} - Offer</title>
      <style>
        /* Add some basic responsive styles */
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
          }
          .main-content {
            padding: 10px !important;
          }
          .button {
            width: 100% !important;
          }
        }
      </style>
    </head>
    <body
      style="
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
      "
    >
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4; padding: 20px 0"
      >
        <tr>
          <td align="center">
            <!-- Container -->
            <table
              class="container"
              width="600"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="background-color: #ffffff; margin: 0 auto"
            >
              <!-- Header -->
              <tr>
                <td style="background-color: #4caf50; padding: 20px">
                  <h1 style="color: #ffffff; margin: 0">
                    ${companyName}
                  </h1>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td class="main-content" style="padding: 20px">
                  <!-- Include recipient's name in the greeting -->
                  <h2>${greetingMessage} ${recipientName}</h2>
                  <p style="font-size: 16px; line-height: 1.5; color: #555555">
                    ${leadMessage}
                  </p>

                  <p style="font-size: 16px; line-height: 1.5; color: #555555">
                    Use the code <strong>${additionalMessage}</strong> to avail this offer. 
                    ${contactMessage}
                  </p>

                  <p style="font-size: 16px; line-height: 1.5; color: #555555">
                    If you have any questions, feel free to contact us at
                    <a href="mailto:${
                      signatureData.email
                    }" style="color: #4caf50"
                      >${signatureData.phone}</a
                    >.
                  </p>

                  <p style="font-size: 16px; line-height: 1.5; color: #555555">
                    Best regards,<br>
                    ${signatureData.name}<br>
                    ${
                      signatureData.designation
                        ? signatureData.designation + "<br>"
                        : ""
                    }
                    ${
                      signatureData.company
                        ? signatureData.company + "<br>"
                        : ""
                    }
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td
                  style="
                    background-color: #f4f4f4;
                    padding: 10px;
                    text-align: center;
                    font-size: 14px;
                    color: #555555;
                  "
                >
                  &copy; 2024 TrueROI. All rights reserved.
                  <br />
                  <a href="http://localhost:5173/unsubscribe?clientmail=${recipientEmail}&userid=${userId}" 
                  target="_blank" style="color: #4caf50"
                    >Unsubscribe</a
                  >
                </td>
              </tr>
            </table>
            <!-- End Container -->
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

//--------------------Send Email------------------------//

export const sendEmail = async (req, res) => {
  const {
    activityName,
    subjectName,
    recipientMail,
    messageData,
    signatureData,
    userId,
  } = req.body;

  try {
    const objectId = ObjectId.createFromHexString(userId);
    const recipients = JSON.parse(recipientMail);
    const recipientId = [];
    const rejectedEmail = [];
    const date = new Date().toLocaleString(undefined, {
      timeZone: "Asia/Kolkata",
    });

    const user = await authCollection.findOne({ _id: objectId });
    const unsubscribe = await emailCollection.findOne({ Id: userId });

    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }

    const unsubscribedEmails = unsubscribe?.UnsubscribedMail || [];

    // Loop through each recipient and send a personalized email if they are not unsubscribed
    for (const recipient of recipients) {
      const recipientName = Object.keys(recipient)[0];
      const recipientEmail = recipient[recipientName];

      // Check if the recipient email is in the unsubscribed list
      if (unsubscribedEmails.includes(recipientEmail)) {
        continue; // Skip sending email to unsubscribed recipients
      }

      // Prepare the email template with the dynamic data
      const htmlContent = generateEmailTemplate(
        messageData.companyName,
        messageData.greetingMessage,
        messageData.leadMessage,
        messageData.additionalMessage,
        messageData.contactMessage,
        signatureData,
        recipientName,
        recipientEmail,
        userId
      );

      // Send the email using Nodemailer
      const mailStatus = await transporter.sendMail({
        ...mailOptions,
        to: recipientEmail,
        subject: subjectName,
        html: htmlContent,
      });

      recipientId.push(mailStatus.accepted);
      rejectedEmail.push(mailStatus);
    }

    if (recipientId.length > 0) {
      const userExisted = await emailCollection.findOne({ Id: userId });

      if (!userExisted) {
        await emailCollection.insertOne({
          Id: userId,
          SentOn: [date],
          Activity: [activityName],
          SendTo: [recipientMail],
          Email: [
            {
              subjectName,
              messageData,
              signatureData,
            },
          ],
        });
      } else {
        await emailCollection.findOneAndUpdate(
          { Id: userId },
          {
            $push: {
              SentOn: date,
              Activity: activityName,
              SendTo: recipientMail,
              Email: {
                subjectName,
                messageData,
                signatureData,
              },
            },
          }
        );
      }
      return res.status(200).json({ mailSend: recipientId });
    } else {
      return res.status(400).send({ msg: "Failed to send emails" });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};


//-------------Email Campaign details------------------//

export const getEmailCampaignDetails = async (req, res) => {
  try {
    const { userID } = req.body;
    const objectId = ObjectId.createFromHexString(userID);
    // Check if the user exists in the authCollection
    const user = await authCollection.findOne({ _id: objectId });
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }

    // Find all email campaign details associated with the user ID
    const emailCampaignDetails = await emailCollection
      .find({ Id: userID })
      .toArray();

    // Check if any email campaign details are found
    if (emailCampaignDetails.length > 0) {
      return res.status(200).json(emailCampaignDetails);
    } else {
      return res.status(404).send({ msg: "No email campaign details found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};

//-----------------Unsubscribe Email------------------//

export const unsubscribeEmail = async (req, res) => {
  const { clientmail, userId } = req.body;
  try {
    if (!clientmail || !userId) {
      return res
        .status(400)
        .send("Invalid request. No email or user ID provided.");
    }
    const userEmail = await emailCollection.findOne({ Id: userId });
    if (!userEmail) {
      // If the user doesn't exist, create a new entry with the unsubscribed mail
      await emailCollection.insertOne({
        Id: userId,
        UnsubscribedMail: [clientmail],
      });
    } else {
      // If the user exists, update their UnsubscribedMail array
      await emailCollection.updateOne(
        { Id: userId },
        { $addToSet: { UnsubscribedMail: clientmail } } // Using $addToSet to avoid duplicates
      );
    }
    return res.status(200).send("Email unsubscribed successfully.");
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
};
