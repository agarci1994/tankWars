"use strict";

async function main(tank) {
  // variable
  const DIFFERENCE_DEGREES = 15;
  const SAFE_DISTANCE = 100;
  const WIDTH = 1340;
  const HEIGHT = 1000;
  const INIT_POSITION_X = await tank.getX();

  let positionEnemy = 0;
  let distanceEnemy = 0;
  let damage;
  // position the radar head-on
  let angle = (await tank.getX()) > WIDTH / 2 ? 150 : -20;

  // auxiliary functions

  async function searchEnemy(tank) {
    angle === 360 ? (angle = 0) : (angle += DIFFERENCE_DEGREES);
    // locate enemy
    distanceEnemy = await getLocation(tank, angle);
    distanceEnemy && (positionEnemy = angle);
    // fire
    await shootFire(tank, distanceEnemy);
  }

  async function attackEnemy(tank) {
    damage = await tank.getDamage()
    while ((await getLocation(tank, angle)) === 0 && damage === (await tank.getDamage())) {
      await searchEnemy(tank);
    }
    await shootFire(tank, distanceEnemy);
  }

  async function shootFire(tank, distance) {
    //close range attack
    if (distance < 100 && distance) {
      for (let i = positionEnemy; i < 360; i + DIFFERENCE_DEGREES) {
        i % 2 === 0 && await tank.shoot(i, 100);
      }
    }
    //long distance attack
    else{
      await tank.shoot(positionEnemy, 700);
      await tank.shoot(positionEnemy + DIFFERENCE_DEGREES, 700);
    }
  }

  async function getLocation(tank, angle) {
    return await tank.scan(angle, 10);
  }

  async function watchMode(tank, direction) {
    switch (direction) {
      case 'y':
        distanceEnemy = await getLocation(tank, 180)
        distanceEnemy ? await shootFire(tank, distanceEnemy) : await shootFire(tank, 180)
        distanceEnemy = await getLocation(tank, 0)
        distanceEnemy ? await shootFire(tank, distanceEnemy) : await shootFire(tank, 0)
        break;
      case 'x':
        distanceEnemy = await getLocation(tank, 90)
        distanceEnemy ? await shootFire(tank, distanceEnemy) : await shootFire(tank, 90)
        distanceEnemy = await getLocation(tank, 270)
        distanceEnemy ? await shootFire(tank, distanceEnemy) : await shootFire(tank, 270)

    }
  }

  async function scapeEnemy(tank) {
    damage = await tank.getDamage()
    // go top
    while ((await tank.getY()) < (HEIGHT - (SAFE_DISTANCE)) && damage === (await tank.getDamage())) {
      await tank.drive(90, 50);
      await watchMode(tank, "y")
    }
    damage = await tank.getDamage()
    // go right
    while ((await tank.getX()) < (WIDTH - SAFE_DISTANCE) && damage === (await tank.getDamage())) {
      await tank.drive(0, 50);
      await watchMode(tank, "x")
    }
    damage = await tank.getDamage()
    // go down
    while ((await tank.getY()) > SAFE_DISTANCE && damage === (await tank.getDamage())) {
      await tank.drive(270, 50);
      await watchMode(tank, "y")
    }
    damage = await tank.getDamage()
    // go left
    while ((await tank.getX()) > (SAFE_DISTANCE * 2) && damage === (await tank.getDamage())) {
      await tank.drive(180, 50);
      await watchMode(tank, "x")
    }

    scapeEnemy(tank)
  }

  // main loop

  while (true) {
    damage = await tank.getDamage();
    // Find the center
    if (INIT_POSITION_X >= WIDTH / 2) {
      //go right
      while (
        (await tank.getX()) >= (WIDTH / 2) && damage === (await tank.getDamage())
      ) {
        await tank.drive(180, 100);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
      while (
        (await tank.getX()) < (WIDTH / 2) && damage === (await tank.getDamage())
      ) {
        await tank.drive(0, 0)
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
    } else {
      // go left
      while (damage === (await tank.getDamage()) && (await tank.getX()) <= (WIDTH / 2)) {
        await tank.drive(0, 100);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
      while (damage === (await tank.getDamage()) && (await tank.getX()) > WIDTH / 2) {
        await tank.drive(0, 0);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }

    }
    await scapeEnemy(tank)
  }
}