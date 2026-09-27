# Arsenal

Reusable low-poly models for the 3D set pieces. Build a model once here, then
place it in any scene by id.

## Conventions

- Units: every model is normalized to length 1 along its main axis. The scene
  passes the on-screen length when it places an instance.
- Axes: `+z` is forward (bow, nose or gun), `+y` is up, `x` is the beam or
  wingspan. The origin sits at the waterline or on the ground, in the middle of
  the model.
- Colour: real paint is baked into the vertex colours (`palette.ts`). Place
  arsenal models with a white instance colour so the paint shows as is.
- Geometry: build with the helpers in `parts.ts` (`box`, `tube`, `rod`,
  `plan`, `profile`, `dome`, `star`), then merge them with `model()`. The
  result is one static `BufferGeometry` per id, drawn as an `InstancedMesh`.

## Catalog

| Id                     | Model                                             | Side    |
| ---------------------- | ------------------------------------------------- | ------- |
| `c47`                  | C-47 Skytrain with invasion stripes               | Allied  |
| `horsa`                | Airspeed Horsa glider with invasion stripes       | Allied  |
| `b24`                  | B-24 Liberator                                    | Allied  |
| `us-battleship`        | Nevada-class battleship                           | Allied  |
| `us-battleship-firing` | Same ship with the guns trained to starboard      | Allied  |
| `fletcher-destroyer`   | Fletcher-class destroyer                          | Allied  |
| `attack-transport`     | Attack transport with its landing craft on davits | Allied  |
| `lcvp`                 | LCVP Higgins boat, loaded, ramp up                | Allied  |
| `lcvp-open`            | LCVP Higgins boat, ramp down                      | Allied  |
| `lct`                  | LCT Mk 5 carrying three tanks                     | Allied  |
| `sherman`              | M4 Sherman                                        | Allied  |
| `sherman-dd`           | Sherman DD with its flotation screen raised       | Allied  |
| `infantry`             | Rifle squad of eight                              | Allied  |
| `paratrooper`          | Paratrooper under canopy                          | Allied  |
| `panzer-iv`            | Panzer IV Ausf. H with side skirts                | Axis    |
| `casemate`             | Atlantic Wall gun casemate                        | Axis    |
| `mg-nest`              | Tobruk machine-gun nest                           | Axis    |
| `hedgehog`             | Czech hedgehog beach obstacle                     | Axis    |
| `village`              | Normandy village with a church                    | Neutral |

## Adding a model

1. Write the builder in the matching file (`air.ts`, `sea.ts`, `land.ts`,
   `defenses.ts`, `buildings.ts`) and reuse `palette.ts` colours.
2. Register it in `index.ts` with its real name, side and length in metres.
3. Add a row to the catalog above.
4. Give the scene a capacity for the new id and place it with `kit.unit(id, ...)`.
