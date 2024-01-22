import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import * as nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  secure: true,
  port: 465,
  auth: {
    user: "obstructiondetection@zohomail.eu",
    pass: "TCHT5d2nAMcX",
  },
});

const createMailOptions = (plate_number: string, violations: string[], email: string) => {
  const mailOptions = {
    from: "obstructiondetection@zohomail.eu",
    to: email,
    subject: `Violation - ${plate_number}`, 
    html: `<div><p>Dear user,</p></br>
    </br>
    <p>We hope this email finds you well. Our records indicate that your vehicle, with the license plate number <strong>${plate_number}</strong>, was recently detected in violation of traffic regulations due to <strong>${violations.join(", ")}</strong>.</p></br>
    </br>
    <h4><strong>Violation Details:</strong></h4></br>
    </br>
    <p><strong>Types:</strong> ${violations.join(" | ")}</p></br>
    <p><strong>Date:</strong> ${formatDate(new Date())}</p></br>
    <hr></br>
    <p>We kindly remind you to adhere to traffic rules and ensure that your vehicle is parked in designated areas to avoid any inconvenience.</p></br>
    </br>
    <p>If you have any concerns or would like to dispute this violation, please contact us within [number of days] days of receiving this email.</p></br>
    </br>
    <p>Thank you for your cooperation in maintaining road safety.</p></br>
    </div>`, // plain text body
   };

   return mailOptions;
}



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  async setChild1(
    @Query('p') plate_number: string | undefined,
    @Query('v') violations: string | undefined,
    @Query('e') email: string | undefined,
  ) {
    try {
      console.log("-------------------------------------");
      console.log(plate_number, violations, email);

      //! DATA CLEANING
      if (plate_number == undefined) {
        const e = 'ERROR: Plate Number query param is undefined';
        console.log(e);
        return e;
      }

      if (violations == undefined) {
        const e = 'ERROR: Violations query param is undefined';
        console.log(e);
        return e;
      }

      if (email == undefined) {
        const e = 'ERROR: Email query param is undefined';
        console.log(e);
        return e;
      }

      if (!isValidPlateNumber(plate_number)) {
        const e = 'ERROR: Invalid plate number';
        console.log(e);
        return e;
      }

      if (violations.length != 3) {
        const e = 'ERROR: Violations query param is not 3 characters';
        console.log(e);
        return e;
      }

      if (!(violations.includes('1') || violations.includes('0'))) {
        const e = 'ERROR: Violations query param is not 0 or 1';
        console.log(e);
        return e;
      }

      if (!isValidEmail(email)) {
        const e = 'ERROR: Invalid email';
        console.log(e);
        return e;
      }


      //! FORMAT PLATE_NUMBER (add space after the third character)
      plate_number = plate_number.slice(0, 3) + " " + plate_number.slice(3, plate_number.length)

      //! GET VIOLATION LIST
      let violations_list = [];
      if (violations[0] == '1') {
        violations_list.push("Obstruction")
      }
      if (violations[1] == '1') {
        violations_list.push("Unregistered")
      }
      if (violations[2] == '1') {
        violations_list.push("Coding")
      }



      //! SEND EMAIL
      transporter.sendMail(createMailOptions(plate_number, violations_list, email), function(err, info) {
        if (err) {
          console.log(err)
          throw err;
        } else {
          console.log("---> Email sent")
          console.log(info);
        }

      });


      console.log('Success!');
      return `Success`;
    } catch (error) {
      console.log(error);
      return `Fail`;
    }
  }
}

function isValidEmail(email: string): boolean {
  // Regular expression for basic email validation
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return emailRegex.test(email);
}

type ViolationType = "Obstruction" | "Unregistered" | "Coding";


function isValidPlateNumber(plateNumber: string): boolean {
  // Define the regular expression pattern
  const plateNumberPattern = /^[a-zA-Z]{3}[\s-]*\d{3,4}$/;
  console.log(`isValidPlateNumber: ${plateNumberPattern.test(plateNumber)}`)
  // Test if the plate number matches the pattern
  return plateNumberPattern.test(plateNumber);
}


// Format Date to 6:34 PM - January 11, 2022
const formatDate = (date: Date): string => {
  // Add 8 hours to date
  date.setHours(date.getHours() + 8);
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${amPm}`;

  return `${formattedDate}`;
};