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
      toUpdate = { emergency };
    } else if (latitude != 0 && longitude != 0) {
      console.log('REQUEST TYPE: Location');
      toUpdate = { latitude, longitude };
    }

    await admin
      .firestore()
      .collection('location')
      .doc('child1')
      .update(toUpdate);

    return `SUCCESS -> latitude: ${latitude}, longitude: ${longitude}, emergency: ${emergency}`;
  }
}
