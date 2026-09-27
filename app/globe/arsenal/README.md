# Arsenal

Reusable low-poly models for the 3D set pieces. Build a model once here, then
place it in any scene by id.

## Conventions

- Units: every model is normalized to length 1 along its main axis. The scene
  passes the on-screen length when it places an instance. Exception: `bef-soldier`
  is normalized to height 1, feet at y=0; its `meters: 1.75` and the scalar
  passed to `kit.unit` describe height, not length. Do not reuse the squad scale.
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

## Dunkirk (1940)

| Id                 | Model                                                        | Scale       | Side   |
| ------------------ | ------------------------------------------------------------ | ----------- | ------ |
| `vw-destroyer`     | V/W-class destroyer, four single shields and two funnels     | 95 m long   | Allied |
| `dunkirk-yacht`    | Cream and blue motor yacht, varnished cabin, open aft deck   | 15 m long   | Allied |
| `dunkirk-trawler`  | Fishing trawler, ochre wheelhouse, working boom and winch    | 22 m long   | Allied |
| `dunkirk-lifeboat` | Open lifeboat, thwarts, oars and seated helmsman             | 8 m long    | Allied |
| `spitfire-mk1`     | Elliptical-wing Spitfire Mk I, earth/green, RAF roundels     | 9.1 m long  | Allied |
| `ju87b`            | Ju 87 B, inverted gull wings and fixed spatted undercarriage | 11 m long   | Axis   |
| `bef-soldier`      | One BEF soldier with Brodie helmet, webbing and pack         | 1.75 m tall | Allied |

These original procedural models depict representative 1940 silhouettes, not
specific named vessels or aircraft serials. They have no 1944 invasion stripes.
Ship origins are at waterline y=0; length 1 follows +z, including the lifeboat's
perimeter gunwale. Ships contain no evacuation passengers; the lifeboat has
only its seated helmsman. The scene instances passengers separately. Aircraft
have no baked bombs. Each builder returns one merged vertex-colour geometry,
with no material groups, for one instanced draw per type. Target budgets are
8,000 triangles per vehicle and 600 per individual soldier.

## Adding a model

1. Write the builder in the matching file (`air.ts`, `sea.ts`, `land.ts`,
   `defenses.ts`, `buildings.ts`) and reuse `palette.ts` colours.
2. Register it in `index.ts` with its real name, side and length in metres.
3. Add a row to the catalog above.
4. Give the scene a capacity for the new id and place it with `kit.unit(id, ...)`.

## Aviation and atomic scenes

`aviation.ts` supplies Bf 109, Fw 190, Spitfire IX, P-51D and B-29 models in
`map` and `scene` detail, plus a Spitfire I map model. The globe rotates these
from arsenal +Z forward to its +X convention and preserves their baked paint.
The scene IDs are `bf109`, `fw190`, `spitfire-mk9`, `p51d` and `b29`.
`atomic-models.ts` supplies the exterior-only `little-boy` and `fat-man` models.
