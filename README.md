# Martian robot controlling

## Getting started

The service is completely containerized, if there is redis service running
in the local machine, then the app can be run just with:

```sh
npm install && npm start
```

if there is no redis running in the machine:

```sh
docker-compose run --rm martian
```

## command will start docker container with required services in it.

when app starts, grid of the robot must be defined between 0 and 50 cells:

```sh
Commands> 20 25
NEW GRID DEFINED
```

After defining a grid, we must place a robot on it with direction to N(North), S(South), E(Easet) and W(West)

```sh
Commands> 5 8 N
Commands> ROBOT PLACED
```

if the robot's coordinates is off the grid, controller will nofity about that:

```sh
Commands> 30 40 E
Commands> Robot's coordinates must be on the grid
```

After placing the robot, we are ready to give movement commands with F(forward), L(turn 90 degree left), R(turn 90 degree right)

```sh
Commands> RFRFRFLLLFFFFFFRRF
Commands> current position: 5 12 S
```

This movement of the robot is saved in the redis, new move command will use those current position.
Commands are CASE SENSITIVE.

PS: many improvement could be done here but due to my schedules, i tried to make it work in short time with less code and not high fault tolerance.
