import { db } from "../DB/mongo-db.js";
import dotenv from "dotenv";
import readXlsxFile from "read-excel-file/node";

dotenv.config();

export const contactCollection = db.collection("List");

//------------List Additions------------------------//

export const addContact = async (req, res) => {
  const { name, email, phone, userId } = req.body;

  try {
    // Find the contact list by userId in contactCollection
    const list = await contactCollection.findOne({ Id: userId });
    if (list) {
      // Check if the email already exists in the ClientData array
      const emailExists = list.ClientData.find(
        (contact) => contact.Email === email
      );
      // Check if the phone already exists in the ClientData array
      const phoneExists = list.ClientData.find(
        (contact) => contact.Phone === phone
      );
      // Return specific message if both email and phone exist
      if (emailExists && phoneExists) {
        return res.status(402).json({
          msg: "Already exist",
          duplicate: { email: emailExists, phone: phoneExists },
        });
      }
      // Return specific message if email exists
      if (emailExists) {
        return res.status(400).json({
          msg: "Email already exists",
          duplicate: { email: emailExists },
        });
      }
      // Return specific message if phone exists
      if (phoneExists) {
        return res.status(401).json({
          msg: "Phone number already exists",
          duplicate: { phone: phoneExists },
        });
      }
      // If no duplicates, push the new contact to the ClientData array
      await contactCollection.updateOne(
        { Id: userId },
        {
          $push: {
            ClientData: {
              Name: name,
              Email: email,
              Phone: phone,
            },
          },
        }
      );
      return res
        .status(200)
        .json({ msg: "Contact added successfully to the list" });
    } else {
      // If no list exists for the user, create a new one
      const newList = await contactCollection.insertOne({
        Id: userId,
        ClientData: [
          {
            Name: name,
            Email: email,
            Phone: phone,
          },
        ],
      });
      if (newList) {
        return res
          .status(200)
          .json({ msg: "List created and contact added successfully" });
      }
    }
  } catch (error) {
    return res.status(500).send({ msg: "Server Error", error });
  }
};

//------------Show master list----------------------//

export const showList = async (req, res) => {
  const { userId } = req.body;
  try {
    const findUser = await contactCollection.findOne({ Id: userId });
    if (!findUser) {
      return res
        .status(404)
        .send({ msg: "No Contacts Available. Create Your Contact List" });
    }
    return res.status(200).json({ client: findUser.ClientData });
  } catch (error) {
    return res.status(500).send({ msg: error.message });
  }
};

//------------File Upload bulk List----------------//

export const uploadFile = async (req, res) => {
  const { userId } = req.body;
  try {
    // Check if the file was uploaded
    if (!req.file) {
      return res.status(400).send({ msg: "No file uploaded" });
    }
    // The file path and name of the uploaded file can be accessed via req.file
    const filePath = req.file.path; // Path where the file is saved
    const fileName = req.file.filename; // The customized filename
    const uniqueData = [];
    // (Optional) If you are processing an Excel file, you can use readXlsxFile
    await readXlsxFile(filePath).then((rows) => {
      // Process the rows as needed
      const headers = rows[0];
      const row = rows.slice(1);
      const arrayOfObjects = row.map((item) => {
        return {
          Name: item[0],
          Email: item[1],
          Phone: item[2],
        };
      });
      const validateEmail = /^[^@]+@[a-zA-Z0-9.-]+\.(com|in|org|dev|co\.in)$/;
      const validatePhone = (phone) => phone.toString().length === 10;
      const seenEmailsAndPhones = new Set();

      arrayOfObjects.forEach((items) => {
        const { Email, Phone } = items;
        const emailPhoneKey = `${Email}-${Phone}`;
        if (seenEmailsAndPhones.has(emailPhoneKey)) {
          return;
        }
        if (validateEmail.test(Email) && validatePhone(Phone)) {
          // If valid, add to the uniqueData array and mark as seen
          uniqueData.push(items);
          seenEmailsAndPhones.add(emailPhoneKey);
        }
      });
    });
    //Remove the duplicate object by comparing the DB data and the Excel data
    if (uniqueData.length !== 0) {
      const dbData = await contactCollection.findOne({ Id: userId });
      const clientUsers = await dbData.ClientData;
      if (!dbData) {
        return res.status(401).send({ msg: "User not found" });
      }
      if (clientUsers.length === 0) {
        await contactCollection.updateOne(
          { Id: userId },
          {
            $push: {
              ClientData: uniqueData.map((val) => val),
            },
          }
        );
      } else if (clientUsers.length !== 0) {
        const existingEmailsAndPhones = new Set(
          clientUsers.map((item) => `${item.Email}-${item.Phone}`)
        );
        const uniqueDataWithoutDuplicates = uniqueData.filter(
          (item) => !existingEmailsAndPhones.has(`${item.Email}-${item.Phone}`)
        );
        await contactCollection.updateOne(
          { Id: userId },
          {
            $push: {
              ClientData: { $each: uniqueDataWithoutDuplicates },
            },
          }
        );
        if (uniqueDataWithoutDuplicates.length === 0) {
          return res.status(409).send({ msg: "Contacts already exist" });
        }
        return res
          .status(200)
          .send({ msg: "File uploaded successfully Removed Duplicates" });
      }
    }
  } catch (error) {
    return res.status(500).send({ msg: "Internal Server Error", error });
  }
};

//------------Edit Single Client List----------------//

export const editSingleData = async (req, res) => {
  const { Name, Email, Phone, userid, Ind } = req.body;
  try {
    // Find the user by userid
    const user = await contactCollection.findOne({ Id: userid });
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    const clientData = user.ClientData;
    const otherClientsData = clientData.filter((val, index) => {
      if (index !== Ind) {
        return val;
      }
    });
    // Check if the contact already exists with the new email or phone
    const contact = otherClientsData.find(
      (list) => list.Email === Email || list.Phone === Phone
    );
    if (contact) {
      return res.status(403).send({ msg: "Contact already exists" });
    }
    // Update the specific contact in the ClientData array at index `Ind`
    clientData[Ind].Email = Email;
    clientData[Ind].Phone = Phone;
    clientData[Ind].Name = Name;
    // Update the user document in the database
    await contactCollection.findOneAndUpdate(
      { Id: userid }, // Find user by Id
      { $set: { ClientData: clientData } }, // Update the ClientData array
      { new: true } // Return the updated document
    );
    res.status(200).send({ msg: "Contact updated successfully" });
  } catch (error) {
    res.status(500).send({ msg: "Server error" });
  }
};

//------------Delete Single Client List-------------//

export const deleteSingleData = async (req, res) => {
  const { ind, userId } = req.body;
  try {
    const user = await contactCollection.findOne({ Id: userId });
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    const clientData = user.ClientData;
    //Delete the clientData[ind]
    clientData.splice(ind, 1);
    // Update the user document in the database
    await contactCollection.findOneAndUpdate(
      { Id: userId }, // Find user by Id
      { $set: { ClientData: clientData } }, // Update the ClientData array
      { new: true } // Return the updated document
    );
    res.status(200).send({ msg: "Contact deleted successfully" });
  } catch (error) {
    return res.status(500).send({ msg: "Internal Server Error", error });
  }
};

