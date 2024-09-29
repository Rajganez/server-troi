import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";
import { contactCollection } from "../controllers/contactsController.js";
import nodemailer from "nodemailer";

dotenv.config();

export const emailCollection = db.collection("EmailCollection");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "trueroiservices@gmail.com",
    pass: process.env.MAIL_APP_PASSWORD,
  },
  timeout: 30000,
});

const mailOptions = {
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
  recipientName
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
                  <a href="http://localhost:5173/" style="color: #4caf50"
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
    // Parse recipientMail if it's a string representation of an array of objects
    const recipients = JSON.parse(recipientMail);
    const recipientId = [];
    const date = new Date().toLocaleString(undefined, {
      timeZone: "Asia/Kolkata",
    });
    const user = await contactCollection.findOne({ Id: userId });
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }

    // Loop through each recipient and send a personalized email
    for (const recipient of recipients) {
      const recipientName = Object.keys(recipient)[0];
      const recipientEmail = recipient[recipientName];

      // Prepare the email template with the dynamic data
      const htmlContent = generateEmailTemplate(
        messageData.companyName,
        messageData.greetingMessage,
        messageData.leadMessage,
        messageData.additionalMessage,
        messageData.contactMessage,
        signatureData,
        recipientName
      );
      // Send the email using Nodemailer
      const mailStatus = await transporter.sendMail({
        ...mailOptions,
        to: recipientEmail,
        subject: subjectName,
        html: htmlContent,
      });
      recipientId.push(mailStatus.accepted);
    }
    if (recipientId.length > 0) {
      await emailCollection.insertOne({
        Id: userId,
        SentOn: date,
        Activity: activityName,
        SendTo: recipientMail,
        Email: {
          $push: {
            subjectName,
            messageData,
            signatureData,
          },
        },
      });
      return res.status(200).json({ mailSend: recipientId });
    } else {
      return res.status(400).send({ msg: "Failed to send emails" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Internal Server Error" });
  }
};

//-------------Email Campaign details------------------//

export const getEmailCampaignDetails = async (req, res) => {
  try {
    const { userID } = req.body;

    // Check if the user exists in the contactCollection
    const user = await contactCollection.findOne({ Id: userID });
    if (!user) {
      return res.status(401).send({ msg: "User not found" });
    }

    // Find all email campaign details associated with the user ID
    const emailCampaignDetails = await emailCollection.find({ Id: userID }).toArray();
    
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

