import { Controller, Get, Query } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AppService } from './app.service';

const {
  initializeApp,
  applicationDefault,
  cert,
} = require('firebase-admin/app');
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require('firebase-admin/firestore');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  async setChild1(
    @Query('la') latitude: number | undefined,
    @Query('lo') longitude: number | undefined,
    @Query('e') emergency: number | undefined,
  ) {
    let will_correct_time = false;
    let recipient = '09996755624';
    let formattedTime = '1311231095436';
    try {
      console.log(latitude, longitude, emergency);

      if (latitude == undefined) {
        const e = 'ERROR: Latitude is undefined';
        console.log(e);
        return e;
      }

      if (longitude == undefined) {
        const e = 'ERROR: Longitude is undefined';
        console.log(e);
        return e;
      }

      if (emergency == undefined) {
        const e = 'ERROR: Emergency is undefined';
        console.log(e);
        return e;
      }

      let toUpdate = {};

      if (emergency == 1) {
        console.log('REQUEST TYPE: Emergency');
        toUpdate['emergency'] = '1';
      } else if (latitude != 0 && longitude != 0) {
        console.log('REQUEST TYPE: Location');
        toUpdate['latitude'] = latitude;
        toUpdate['longitude'] = longitude;
      }

      const child1Return = await admin
        .firestore()
        .collection('location')
        .doc('child1')
        .get();
      const child1 = child1Return.data();
      // console.log(child1);

      //! WILL CORRECT TIME
      if (child1.will_correct_time) {
        console.log('REQUEST TYPE: Correct Time');
        // Say to arduino to update time
        will_correct_time = child1.will_correct_time;

        // Update the database to false
        toUpdate['will_correct_time'] = false;

        // Get current time
        const currentTime = new Date(); // Replace this with your current time
        formattedTime = convertToCustomFormat(currentTime);
      }

      //! RECIPIENT
      if (child1.recipient) {
        console.log('Recipient: ', child1.recipient);
        recipient = child1.recipient;
      }

      if (Object.keys(toUpdate).length > 0) {
        await admin
          .firestore()
          .collection('location')
          .doc('child1')
          .update(toUpdate);
      }
      console.log('Success!');
    } catch (error) {
      console.log(error);
    }

    // const now = '1311231095436';
    // const number = '09996755624';

    // #define MONDAY		1
    // #define TUESDAY		2
    // #define WEDNESDAY	3
    // #define THURSDAY	4
    // #define FRIDAY		5
    // #define SATURDAY	6
    // #define SUNDAY		7

    return `-${will_correct_time ? '+' : '-'}${formattedTime}${recipient}`;
  }
}

function convertToCustomFormat(currentTime: Date): string {
  const secOffsetSec = 13 * 1000;
  const timezoneOffset = 8 * 60; // +8 GMT
  const localTime = new Date(
    currentTime.getTime() + timezoneOffset * 60000 + secOffsetSec,
  );

  const month = (localTime.getMonth() + 1).toString().padStart(2, '0');
  const day = localTime.getDate().toString().padStart(2, '0');
  const year = localTime.getFullYear().toString().slice(-2);
  const dayOfWeek = localTime.getDay() === 0 ? 7 : localTime.getDay(); // Adjust Sunday to 7
  const hours = localTime.getHours().toString().padStart(2, '0');
  const minutes = localTime.getMinutes().toString().padStart(2, '0');
  const seconds = localTime.getSeconds().toString().padStart(2, '0');

  const formattedTime = `${day}${month}${year}${dayOfWeek}${hours}${minutes}${seconds}`;
  return formattedTime;
}
