"use strict";

async function main(tank) {
  // variable
  const DIFFERENCE_DEGREES = 15
  const SAFE_DISTANCE = 100
  const WIDTH = 1340
  const HEIGHT = 1000

  let positionEnemy = 0
  let distanceEnemy = 0
  // position the radar head-on
  let angle = await tank.getX() > WIDTH / 2 ? 150 : -15

  // auxiliary functions

  async function searchEnemy(tank) {
    angle === 360 ? (angle = 0) : (angle += DIFFERENCE_DEGREES);
    // locate enemy
    distanceEnemy = await getLocation(tank, angle)
    distanceEnemy && (positionEnemy = angle)
    // fire
    await shootFire(tank, distanceEnemy);
  }

  async function attackEnemy(tank) {
    while (await getLocation(tank, angle) === 0) {
      await searchEnemy(tank)
    }
    await shootFire(tank, distanceEnemy)
  }


  async function shootFire(tank, distance) {
    //close range attack
    if (distance < 100 && distance) {
      for (let i = positionEnemy; i < 360; i + DIFFERENCE_DEGREES) {
        await tank.shoot(i, 100)
      }
    }
    //long distance attack
    else if (distance > 100 && distance) {
      await tank.shoot(positionEnemy, 700)
      await tank.shoot(positionEnemy + DIFFERENCE_DEGREES, 700)
    }
    // free shot
    else {
      await tank.shoot(angle, 500)
    }
  }

  async function getLocation(tank, angle) {
    return await tank.scan(angle, 10);
  }


  // main loop

  while (true) {
    let damage = await tank.getDamage()
    const initPositionX = await tank.getX()

    // Find the center
    if (initPositionX > WIDTH / 2) {
      //go right
      while ((await tank.getX()) > WIDTH / 2) {
        await tank.drive(180, 50);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank)
      }
      while ((await tank.getX()) < WIDTH / 2 && damage === await tank.getDamage()) {
        await tank.drive(0, 0);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank)
      }
    } else {
      // go left
      while ((await tank.getX()) < WIDTH / 2) {
        await tank.drive(0, 50);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank)
      }
      while ((await tank.getX()) > WIDTH / 2 && damage === await tank.getDamage()) {
        await tank.drive(0, 0);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank)
      }
    }

    // scape from the enemy
    if (await tank.getY() <= HEIGHT / 2) {
      damage = await tank.getDamage()
      while (damage === await tank.getDamage() && await tank.getY() > HEIGHT - SAFE_DISTANCE) {
        await tank.drive(115, 100);
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank)
      }
      await tank.drive(45, 0);

    } else {
      damage = await tank.getDamage()
      while (damage === await tank.getDamage() && await tank.getY() < HEIGHT + SAFE_DISTANCE) {
        positionEnemy ? await attackEnemy(tank) : await searchEnemy(tank)
      }
      await tank.drive(315, 0);
    }

  }
}