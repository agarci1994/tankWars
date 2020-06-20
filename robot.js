"use strict";

async function main(tank) {
  // variable
  let angle = 0;
  const differenceDegrees = 15

  // auxiliary functions

  async function shootFire(tank, position) {
   if(position){
     await tank.shoot(angle, 700)
     await tank.shoot(angle + differenceDegrees, 700)
   }
   else{
     await tank.shoot(angle, 100)
   }
  }

  async function getLocation(tank, angle) {
    return await tank.scan(angle, 10);
  }

  // main loop

  while (true) {
    // go up
    while ((await tank.getY()) < 600) {
      angle === 360 ? (angle = 0) : (angle += 20);
      await tank.drive(90, 50);
      // locate enemy
      const position = await getLocation(tank, angle);
      // fire
      await shootFire(tank, position);
    }

    // go right
    while ((await tank.getX()) < 900) {
      angle === 360 ? (angle = 0) : (angle += 20);
      await tank.drive(0, 50);
      // locate enemy
      const position = await getLocation(tank, angle);
      // fire
      await shootFire(tank, position);
    }

    // go down
    while ((await tank.getY()) > 300) {
      angle === 360 ? (angle = 0) : (angle += 20);
      await tank.drive(270, 50);
      // locate enemy
      const position = await getLocation(tank, angle);
      // fire
      await shootFire(tank, position);
    }

    // go left
    while ((await tank.getX()) > 400) {
      angle === 360 ? (angle = 0) : (angle += 20);
      await tank.drive(180, 50);
      // locate enemy
      const position = await getLocation(tank, angle);
      // fire
      await shootFire(tank, position);
    }

  }
}
