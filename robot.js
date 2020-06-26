"use strict";

async function main(tank) {
  // variable
  const DIFFERENCE_DEGREES = 15;
  const SAFE_DISTANCE = 100;
  const WIDTH = 1340;
  const HEIGHT = 1000;
  const TOP = 90
  const BOTTOM = 270
  const LEFT = 180
  const RIGHT = 360
  const INIT_POSITION_X = await tank.getX();

  const positionMyTank = {
    x: null,
    y: null
  }

  let positionEnemy = 0;
  let distanceEnemy = 0;
  let damage;
  // position the radar head-on
  let angle = (await tank.getX()) > WIDTH / 2 ? 150 : -20;

  // auxiliary functions
  /* GET DATA */
  async function getLocation(tank, angle) {
    return await tank.scan(angle, 10);
  }

  async function getMyLocation() {
    positionMyTank.x = await tank.getX()
    positionMyTank.y = await tank.getY()
  }

  async function updateDamage() {
    damage = await tank.getDamage();
  }

  /* ATTACK */
  async function searchEnemy(tank) {
    angle === 360 ? (angle = 0) : (angle += DIFFERENCE_DEGREES);
    // locate enemy
    distanceEnemy = await getLocation(tank, angle);
    distanceEnemy && (positionEnemy = angle);
    // fire
    await shootFire(tank, distanceEnemy, positionEnemy);
  }

  async function attackEnemy(tank) {
    await updateDamage()
    while (
      (await getLocation(tank, angle)) === 0 &&
      damage === (await tank.getDamage())
    ) {
      await searchEnemy(tank);
    }
    await shootFire(tank, distanceEnemy, angle);
  }

  async function shootFire(tank, distance = 600, angle) {
    distance && await tank.shoot(angle, distance);
    distance && await tank.shoot(angle + DIFFERENCE_DEGREES, distance);
  }

  async function watchMode(tank) {
    await getMyLocation()
    if (positionMyTank.x < WIDTH / 2) {
      let i = BOTTOM
      while (i < RIGHT && positionMyTank.x > SAFE_DISTANCE) {
        distanceEnemy = await tank.scan(i, 10);
        distanceEnemy && await shootFire(tank, distanceEnemy, i)
        i === RIGHT ? i = 0 : i += DIFFERENCE_DEGREES
        await getMyLocation()
      }
    } else {
      let i = TOP
      while (i < BOTTOM && positionMyTank.x < (WIDTH - SAFE_DISTANCE)) {
        distanceEnemy = await tank.scan(i, 10);
        distanceEnemy && await shootFire(tank, distanceEnemy, i)
        i === BOTTOM ? i = TOP : i += DIFFERENCE_DEGREES
        await getMyLocation()
      }
    }
    if (positionMyTank.y < HEIGHT / 2) {
      let i = RIGHT
      while (i < LEFT && positionMyTank.y > SAFE_DISTANCE) {
        distanceEnemy = await tank.scan(i, 10);
        distanceEnemy && await shootFire(tank, distanceEnemy, i)
        i === RIGHT ? i = 0 : i += DIFFERENCE_DEGREES
        await getMyLocation()
      }
    } else {
      let i = LEFT
      while (i < RIGHT && positionMyTank.y < (HEIGHT - SAFE_DISTANCE)) {
        distanceEnemy = await tank.scan(i, 10);
        distanceEnemy && await shootFire(tank, distanceEnemy, i)
        i === RIGHT ? i = RIGHT : i += DIFFERENCE_DEGREES
        await getMyLocation()
      }

    }
  }

  /* MOTION */
  async function scapeEnemy(tank) {
    await updateDamage()
    // go top
    while (
      (await tank.getY()) < HEIGHT - SAFE_DISTANCE &&
      damage === (await tank.getDamage())
    ) {
      await tank.drive(90, 50);
      await watchMode(tank);
    }
    await updateDamage()
    // go right
    while (
      (await tank.getX()) < WIDTH - SAFE_DISTANCE &&
      damage === (await tank.getDamage())
    ) {
      await tank.drive(0, 50);
      await watchMode(tank);
    }
    await updateDamage()
    // go down
    while (
      (await tank.getY()) > SAFE_DISTANCE &&
      damage === (await tank.getDamage())
    ) {
      await tank.drive(270, 50);
      await watchMode(tank);
    }
    await updateDamage()
    // go left
    while (
      (await tank.getX()) > SAFE_DISTANCE &&
      damage === (await tank.getDamage())
    ) {
      await tank.drive(180, 50);
      await watchMode(tank);
    }
    scapeEnemy(tank);
  }

  async function getCenter() {
    await updateDamage()
    // Find the center
    if (INIT_POSITION_X >= WIDTH / 2) {
      //go right
      while (
        (await tank.getX()) >= WIDTH / 2 &&
        damage === (await tank.getDamage())
      ) {
        await tank.drive(180, 100);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
      while (
        (await tank.getX()) < WIDTH / 2 &&
        damage === (await tank.getDamage())
      ) {
        await tank.drive(0, 0);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
    } else {
      // go left
      while (
        damage === (await tank.getDamage()) &&
        (await tank.getX()) <= WIDTH / 2
      ) {
        await tank.drive(0, 100);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
      while (
        damage === (await tank.getDamage()) &&
        (await tank.getX()) > WIDTH / 2
      ) {
        await tank.drive(0, 0);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank);
      }
    }
  }

  // main loop
  while (true) {
    await getCenter(tank)
    await scapeEnemy(tank);
  }
}